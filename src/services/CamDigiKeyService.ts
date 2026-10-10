import { CamDigiKeyRequest, CamDigiKeyResponse, VerificationResult } from '../types/camdigikey';

// Configuration
const MOCKOON_BASE_URL = 'http://10.100.42.22:3000';
const USE_MOCK = false; // Set to true for local testing with mockoon

// Real CamDigiKey Configuration
const CAMDIGIKEY_CONFIG = {
  MEMBER_CODE: 'CAMDX-20201222', // Development: CAMDX-20201222, Production: CAMDX-000003
  BASE_URL: 'https://security-server.consumer1.com',
  X_ROAD_CLIENT: 'CAMBODIA/GOV/CAMDX-20201222/MOBILE_APP', // Replace with your actual subsystem code
};

class CamDigiKeyService {
  private baseUrl: string;
  private useMock: boolean;

  constructor() {
    this.baseUrl = USE_MOCK ? MOCKOON_BASE_URL : CAMDIGIKEY_CONFIG.BASE_URL;
    this.useMock = USE_MOCK;
    
    // Validate that the real API URL is secure
    if (!this.useMock && !isValidUrl(this.baseUrl)) {
      console.error('Security Warning: API URL must use HTTPS');
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
   * Verify eKYC with CamDigiKey API
   */
  async verifyEKYC(request: CamDigiKeyRequest): Promise<CamdigiKeyResponse> {
    try {
      if (this.useMock) {
        return this.mockVerifyEKYC(request);
      }

      // Real API call
      const endpoint = `/r1/CAMBODIA/GOV/${CAMDIGIKEY_CONFIG.MEMBER_CODE}/CAMDIGIKEY_KYC/info-idcard-liveness-v2.1`;
      const url = `${this.baseUrl}${endpoint}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Road-Client': CAMDIGIKEY_CONFIG.X_ROAD_CLIENT,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('CamDigiKey API response:', {
        ...data,
        data: {
          ...data.data,
          userInfo: {
            ...data.data.userInfo,
            idNumber: maskSensitiveData(data.data.userInfo.idNumber),
          },
        },
      });
      return data;
    } catch (error) {
      console.error('CamDigiKey API error:', error);
      throw error;
    }
  }

  /**
   * Mock verification for development/testing
   */
  private async mockVerifyEKYC(request: CamDigiKeyRequest): Promise<CamdigiKeyResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return mock response based on the API documentation
    return {
      error: 0,
      message: 'Successfully',
      data: {
        userInfo: {
          idNumber: request.userInfo.idNumber,
          score: 1.0, // Perfect match for demo
          incorrectFields: [],
        },
        faceDocumentScore: 0.9981736, // High confidence
        faceMoiScore: 0.5696822, // Medium confidence (as in example)
      },
    };
  }

  /**
   * Convert CamDigiKey response to app's VerificationResult format
   */
  convertToVerificationResult(response: CamDigiKeyResponse): VerificationResult {
    return {
      success: response.error === 0,
      userInfoScore: response.data.userInfo.score,
      faceDocumentScore: response.data.faceDocumentScore,
      faceMoiScore: response.data.faceMoiScore,
      incorrectFields: response.data.userInfo.incorrectFields,
      timestamp: Date.now(),
    };
  }

  /**
   * Complete eKYC verification workflow
   */
  async completeVerification(
    userInfo: any,
    idImageUri: string,
    livenessImageUris: string[],
    actions: string[]
  ): Promise<VerificationResult> {
    try {
      // Validate inputs
      if (!idImageUri || !livenessImageUris || livenessImageUris.length === 0) {
        throw new Error('Missing required images for verification');
      }

      // Convert images to base64
      const idImageBase64 = await this.convertImageToBase64(idImageUri);
      
      // Use the first liveness image for the API (as per documentation)
      const livenessBase64 = await this.convertImageToBase64(livenessImageUris[0]);

      // Build request
      const request: CamDigiKeyRequest = {
        actions: actions as any,
        userInfo: userInfo,
        idImage: idImageBase64,
        liveness: livenessBase64,
      };

      // Call API
      const response = await this.verifyEKYC(request);

      // Convert to verification result
      return this.convertToVerificationResult(response);
    } catch (error) {
      console.error('Complete verification error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const camdigikeyService = new CamDigiKeyService();