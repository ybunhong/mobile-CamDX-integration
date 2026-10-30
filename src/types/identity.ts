export interface UserInfo {
  idNumber: string;
  firstNameKh: string;
  lastNameKh: string;
  firstNameEn: string;
  lastNameEn: string;
  gender: 'M' | 'F';
  dob: string; // YYYY-MM-DD
  issuedDate: string; // YYYY-MM-DD
  expiredDate: string; // YYYY-MM-DD
}

export interface FormErrors {
  idNumber?: string;
  firstNameKh?: string;
  lastNameKh?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  gender?: string;
  dob?: string;
  issuedDate?: string;
  expiredDate?: string;
}

/** On-device result for a single photo. Scores are normalised to 0–1. */
export interface FaceAnalysis {
  faceDetected: boolean;
  liveness: number;
  quality: number;
  /** Base64-encoded feature vector, or null when no face was found. */
  feature: string | null;
}

/** What the results screen renders, passed through router params. */
export interface IdentityCheckResult {
  liveness: number;
  quality: number;
  /** Raw cosine similarity between the ID photo and the selfie. */
  matchScore: number;
  /** SDK-calibrated similarity percentage (0–100). */
  matchPercentage: number;
  matched: boolean;
  passed: boolean;
  timestamp: number;
}
