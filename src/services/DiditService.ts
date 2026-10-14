import Constants from 'expo-constants';
import { DiditFaceMatchRequest, DiditFaceMatchResponse, DiditPassiveLivenessRequest, DiditPassiveLivenessResponse, DiditVerificationResult } from '../types/didit';

// Configuration from environment variables via Expo Constants
const DIDIT_API_KEY = Constants.expoConfig?.extra?.diditApiKey || '';
const DIDIT_BASE_URL = Constants.expoConfig?.extra?.diditBaseUrl || 'https://api.didit.me';

class DiditService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = DIDIT_API_KEY;
    this.baseUrl = DIDIT_BASE_URL;

    if (!this.apiKey) {
      console.warn('Didit API key not found. Set DIDIT_API_KEY in .env file');
    }
  }

  /**
   * Convert image URI to base64
   */
  async convertImageToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get pure base64
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to convert image to base64');
    }
  }

  /**
   * Call Didit Passive Liveness API
   * Checks if the face is real (not a photo)
   */
  async checkPassiveLiveness(imageBase64: string): Promise<DiditPassiveLivenessResponse> {
    try {
      const endpoint = '/v3/passive-liveness/';
      const url = `${this.baseUrl}${endpoint}`;

      const request: DiditPassiveLivenessRequest = {
        image: imageBase64,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Didit Passive Liveness API error:', errorText);
        throw new Error(`Passive Liveness API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Didit Passive Liveness response:', data);
      return data;
    } catch (error) {
      console.error('Didit Passive Liveness error:', error);
      throw error;
    }
  }

  /**
   * Call Didit Face Match API
   * Compares two face images
   */
  async checkFaceMatch(imageBase64: string, referenceImageBase64: string): Promise<DiditFaceMatchResponse> {
    try {
      const endpoint = '/v3/face-match/';
      const url = `${this.baseUrl}${endpoint}`;

      const request: DiditFaceMatchRequest = {
        image: imageBase64,
        reference_image: referenceImageBase64,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Didit Face Match API error:', errorText);
        throw new Error(`Face Match API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Didit Face Match response:', data);
      return data;
    } catch (error) {
      console.error('Didit Face Match error:', error);
      throw error;
    }
  }

  /**
   * Complete verification workflow
   * Runs both Passive Liveness and Face Match checks
   */
  async completeVerification(
    faceImageUri: string,
    referenceImageUri?: string
  ): Promise<DiditVerificationResult> {
    try {
      // Validate inputs
      if (!faceImageUri) {
        throw new Error('Face image is required for verification');
      }

      // Convert face image to base64
      const faceImageBase64 = await this.convertImageToBase64(faceImageUri);

      // Run Passive Liveness check
      const livenessResult = await this.checkPassiveLiveness(faceImageBase64);

      // Run Face Match if reference image is provided
      let matchScore = 0;
      let matchOutcome = 'inconclusive';

      if (referenceImageUri) {
        const referenceImageBase64 = await this.convertImageToBase64(referenceImageUri);
        const matchResult = await this.checkFaceMatch(faceImageBase64, referenceImageBase64);
        matchScore = matchResult.match_score;
        matchOutcome = matchResult.match_outcome;
      }

      // Build verification result
      return {
        success: livenessResult.success,
        livenessScore: livenessResult.liveness_score,
        livenessOutcome: livenessResult.liveness_outcome,
        matchScore: matchScore,
        matchOutcome: matchOutcome,
        qualityScore: livenessResult.quality_score,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Complete verification error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const diditService = new DiditService();
