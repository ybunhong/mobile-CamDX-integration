// Didit API Types based on official documentation
// https://docs.didit.me

export interface DiditUserInfo {
  idNumber: string;
  firstNameKh: string;
  lastNameKh: string;
  firstNameEn: string;
  lastNameEn: string;
  gender: 'M' | 'F';
  dob: string; // YYYY-MM-DD format
  issuedDate: string; // YYYY-MM-DD format
  expiredDate: string; // YYYY-MM-DD format
}

export interface DiditPassiveLivenessRequest {
  image: string; // base64 encoded image
}

export interface DiditPassiveLivenessResponse {
  success: boolean;
  liveness_score: number; // 0-1
  liveness_outcome: 'live' | 'not_live' | 'inconclusive';
  quality_score: number; // 0-1
  quality_outcome: 'acceptable' | 'unacceptable';
  request_id: string;
}

export interface DiditFaceMatchRequest {
  image: string; // base64 encoded image (probe)
  reference_image: string; // base64 encoded image (reference)
}

export interface DiditFaceMatchResponse {
  success: boolean;
  match_score: number; // 0-1
  match_outcome: 'match' | 'no_match' | 'inconclusive';
  request_id: string;
}

export interface DiditVerificationResult {
  success: boolean;
  livenessScore: number;
  livenessOutcome: string;
  matchScore: number;
  matchOutcome: string;
  qualityScore: number;
  timestamp: number;
}

// Form validation types
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
