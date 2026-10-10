// CamDigiKey API Types based on official documentation
// https://camdx.gov.kh/docs/open-api/ekyc

export interface CamDigiKeyUserInfo {
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

export interface CamDigiKeyRequest {
  actions: string[]; // ["1", "2", "3"] - 1: turn left, 2: turn right, 3: nod
  userInfo: CamDigiKeyUserInfo;
  idImage: string; // base64 encoded image
  liveness: string; // base64 encoded image
}

export interface CamDigiKeyUserInfoResponse {
  idNumber: string;
  score: number; // Range [0,1]
  incorrectFields: string[];
}

export interface CamDigiKeyResponseData {
  userInfo: CamDigiKeyUserInfoResponse;
  faceDocumentScore: number; // Range [0,1]
  faceMoiScore: number; // Range [0,1]
}

export interface CamDigiKeyResponse {
  error: number;
  message: string;
  data: CamDigiKeyResponseData;
}

// Liveness action types
export type LivenessAction = '1' | '2' | '3'; // 1: left, 2: right, 3: nod

export interface LivenessStep {
  action: LivenessAction;
  instruction: string;
  completed: boolean;
  imageUri?: string;
}

// Verification result types
export interface VerificationResult {
  success: boolean;
  userInfoScore: number;
  faceDocumentScore: number;
  faceMoiScore: number;
  incorrectFields: string[];
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
