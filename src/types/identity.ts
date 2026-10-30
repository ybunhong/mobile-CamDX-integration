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
  /** Faces the detector reported — used to explain failures. */
  faceCount: number;
}

/** What the local server stores per person. In memory only. */
export interface Enrollment {
  idNumber: string;
  userInfo: UserInfo;
  /** Feature from the enrolment selfie (best quality reference). */
  selfieFeature: string;
  /** Feature from the portrait on the ID card. */
  documentFeature: string;
  createdAt: number;
}

export type MatchKind = 'selfie' | 'document';

export interface MatchResult {
  enrollment: Enrollment;
  similarity: number;
  percentage: number;
  matched: boolean;
}
