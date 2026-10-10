import { CamDigiKeyUserInfo } from '../../types/camdigikey';
import { camdigikeyService } from '../CamDigiKeyService';

// Mock the convertImageToBase64 method
jest.mock('../CamDigiKeyService', () => {
  const originalModule = jest.requireActual('../CamDigiKeyService');
  return {
    ...originalModule,
    camdigikeyService: {
      ...originalModule.camdigikeyService,
      convertImageToBase64: jest.fn().mockResolvedValue('base64-mock-image'),
    },
  };
});

describe('CamDigiKeyService', () => {
  const mockUserInfo: CamDigiKeyUserInfo = {
    idNumber: '011196245',
    firstNameKh: 'ការឌុល',
    lastNameKh: 'អេង',
    firstNameEn: 'KADOL',
    lastNameEn: 'ENG',
    gender: 'M',
    dob: '2000-05-06',
    issuedDate: '2016-03-23',
    expiredDate: '2026-03-22',
  };

  const mockIdImage = 'file://mock-image.jpg';
  const mockLivenessImages = ['file://mock-liveness.jpg'];
  const mockActions = ['1', '2', '3'];

  describe('completeVerification', () => {
    it('should successfully complete verification with mock data', async () => {
      const result = await camdigikeyService.completeVerification(
        mockUserInfo,
        mockIdImage,
        mockLivenessImages,
        mockActions
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.userInfoScore).toBeGreaterThan(0);
      expect(result.faceDocumentScore).toBeGreaterThan(0);
      expect(result.faceMoiScore).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should return mock scores when using mock mode', async () => {
      const result = await camdigikeyService.completeVerification(
        mockUserInfo,
        mockIdImage,
        mockLivenessImages,
        mockActions
      );

      expect(result.userInfoScore).toBe(1.0);
      expect(result.faceDocumentScore).toBe(0.9981736);
      expect(result.faceMoiScore).toBe(0.5696822);
    });

    it('should return empty incorrect fields for mock data', async () => {
      const result = await camdigikeyService.completeVerification(
        mockUserInfo,
        mockIdImage,
        mockLivenessImages,
        mockActions
      );

      expect(result.incorrectFields).toEqual([]);
    });

    it('should handle verification with different user data', async () => {
      const differentUserInfo: CamDigiKeyUserInfo = {
        ...mockUserInfo,
        idNumber: '023456789',
        firstNameEn: 'SOKH',
        lastNameEn: 'MUNY',
      };

      const result = await camdigikeyService.completeVerification(
        differentUserInfo,
        mockIdImage,
        mockLivenessImages,
        mockActions
      );

      expect(result.success).toBe(true);
      expect(result.userInfoScore).toBe(1.0);
    });
  });

  describe('verifyEKYC', () => {
    it('should return mock response when useMock is true', async () => {
      const request = {
        actions: mockActions,
        userInfo: mockUserInfo,
        idImage: 'base64-mock-image',
        liveness: 'base64-mock-liveness',
      };

      const response = await camdigikeyService['verifyEKYC'](request);

      expect(response).toBeDefined();
      expect(response.error).toBe(0);
      expect(response.message).toBe('Successfully');
      expect(response.data).toBeDefined();
    });

    it('should return data with expected structure', async () => {
      const request = {
        actions: mockActions,
        userInfo: mockUserInfo,
        idImage: 'base64-mock-image',
        liveness: 'base64-mock-liveness',
      };

      const response = await camdigikeyService['verifyEKYC'](request);

      expect(response.data.userInfo).toBeDefined();
      expect(response.data.userInfo.idNumber).toBe(mockUserInfo.idNumber);
      expect(response.data.userInfo.score).toBeDefined();
      expect(response.data.faceDocumentScore).toBeDefined();
      expect(response.data.faceMoiScore).toBeDefined();
    });
  });

  describe('convertToVerificationResult', () => {
    it('should convert API response to verification result', () => {
      const mockResponse = {
        error: 0,
        message: 'Successfully',
        data: {
          userInfo: {
            idNumber: mockUserInfo.idNumber,
            score: 0.95,
            incorrectFields: [],
          },
          faceDocumentScore: 0.98,
          faceMoiScore: 0.75,
        },
      };

      const result = camdigikeyService['convertToVerificationResult'](mockResponse);

      expect(result.success).toBe(true);
      expect(result.userInfoScore).toBe(0.95);
      expect(result.faceDocumentScore).toBe(0.98);
      expect(result.faceMoiScore).toBe(0.75);
      expect(result.incorrectFields).toEqual([]);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle failed verification response', () => {
      const mockResponse = {
        error: 1,
        message: 'Failed',
        data: {
          userInfo: {
            idNumber: mockUserInfo.idNumber,
            score: 0.3,
            incorrectFields: ['firstNameEn', 'lastNameEn'],
          },
          faceDocumentScore: 0.5,
          faceMoiScore: 0.4,
        },
      };

      const result = camdigikeyService['convertToVerificationResult'](mockResponse);

      expect(result.success).toBe(false);
      expect(result.userInfoScore).toBe(0.3);
      expect(result.incorrectFields).toEqual(['firstNameEn', 'lastNameEn']);
    });
  });
});
