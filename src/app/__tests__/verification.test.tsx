import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VerificationScreen from '../verification';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: () => ({
    userInfo: JSON.stringify({
      idNumber: '011196245',
      firstNameKh: 'ការឌុល',
      lastNameKh: 'អេង',
      firstNameEn: 'KADOL',
      lastNameEn: 'ENG',
      gender: 'M',
      dob: '2000-05-06',
      issuedDate: '2016-03-23',
      expiredDate: '2026-03-22',
    }),
    idImage: 'file://mock-image.jpg',
    livenessImages: JSON.stringify(['file://mock-liveness.jpg']),
    actions: JSON.stringify(['1', '2', '3']),
  }),
}));

// Mock Alert
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock CamDigiKeyService
jest.mock('../../services/CamDigiKeyService', () => ({
  camdigikeyService: {
    completeVerification: jest.fn().mockResolvedValue({
      success: true,
      userInfoScore: 1.0,
      faceDocumentScore: 0.998,
      faceMoiScore: 0.57,
      incorrectFields: [],
      timestamp: Date.now(),
    }),
  },
}));

describe('VerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the verification screen', () => {
    const { getByText } = render(<VerificationScreen />);
    
    expect(getByText('Identity Verification')).toBeTruthy();
    expect(getByText('Review your information before verification')).toBeTruthy();
  });

  it('should render user information section', () => {
    const { getByText } = render(<VerificationScreen />);
    
    expect(getByText('User Information')).toBeTruthy();
    expect(getByText('ID Number:')).toBeTruthy();
    expect(getByText('Name (KH):')).toBeTruthy();
    expect(getByText('Name (EN):')).toBeTruthy();
    expect(getByText('Gender:')).toBeTruthy();
    expect(getByText('Date of Birth:')).toBeTruthy();
  });

  it('should render capture summary section', () => {
    const { getByText } = render(<VerificationScreen />);
    
    expect(getByText('Capture Summary')).toBeTruthy();
    expect(getByText('ID Card:')).toBeTruthy();
    expect(getByText('Liveness Steps:')).toBeTruthy();
    expect(getByText('Actions:')).toBeTruthy();
  });

  it('should render action buttons', () => {
    const { getByText } = render(<VerificationScreen />);
    
    expect(getByText('Back')).toBeTruthy();
    expect(getByText('Start Verification')).toBeTruthy();
  });

  it('should display user information correctly', () => {
    const { getByText } = render(<VerificationScreen />);
    
    expect(getByText('011196245')).toBeTruthy();
    expect(getByText('KADOL ENG')).toBeTruthy();
    expect(getByText('Male')).toBeTruthy();
    expect(getByText('2000-05-06')).toBeTruthy();
  });

  it('should display capture summary correctly', () => {
    const { getByText } = render(<VerificationScreen />);
    
    expect(getByText('✓ Captured')).toBeTruthy();
    expect(getByText('1/3 Completed')).toBeTruthy();
    expect(getByText('1, 2, 3')).toBeTruthy();
  });

  it('should handle verification button press', async () => {
    const { getByText } = render(<VerificationScreen />);
    const { camdigikeyService } = require('../../services/CamDigiKeyService');
    
    const verifyButton = getByText('Start Verification');
    fireEvent.press(verifyButton);
    
    await waitFor(() => {
      expect(camdigikeyService.completeVerification).toHaveBeenCalled();
    });
  });

  it('should handle back button press', () => {
    const { router } = require('expo-router');
    const { getByText } = render(<VerificationScreen />);
    
    const backButton = getByText('Back');
    fireEvent.press(backButton);
    
    expect(router.back).toHaveBeenCalled();
  });

  it('should show loading state during verification', async () => {
    const { getByText } = render(<VerificationScreen />);
    const { camdigikeyService } = require('../../services/CamDigiKeyService');
    
    // Make the verification take some time
    camdigikeyService.completeVerification.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        userInfoScore: 1.0,
        faceDocumentScore: 0.998,
        faceMoiScore: 0.57,
        incorrectFields: [],
        timestamp: Date.now(),
      }), 100))
    );
    
    const verifyButton = getByText('Start Verification');
    fireEvent.press(verifyButton);
    
    // Button should show loading state
    expect(getByText('Verifying...')).toBeTruthy();
  });

  it('should display verification results after successful verification', async () => {
    const { getByText, queryByText } = render(<VerificationScreen />);
    const { camdigikeyService } = require('../../services/CamDigiKeyService');
    
    const verifyButton = getByText('Start Verification');
    fireEvent.press(verifyButton);
    
    await waitFor(() => {
      expect(queryByText('Verification Results')).toBeTruthy();
    });
  });

  it('should show new verification button after completion', async () => {
    const { getByText, queryByText } = render(<VerificationScreen />);
    const { camdigikeyService } = require('../../services/CamDigiKeyService');
    
    const verifyButton = getByText('Start Verification');
    fireEvent.press(verifyButton);
    
    await waitFor(() => {
      expect(queryByText('New Verification')).toBeTruthy();
    });
  });
});
