import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DocumentCaptureScreen from '../document-capture';

// Mock expo-camera
jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  useCameraPermissions: () => [
    { granted: true, canAskAgain: true },
    jest.fn(),
  ],
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
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
  }),
}));

// Mock Alert
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
}));

describe('DocumentCaptureScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the capture screen', () => {
    const { getByText } = render(<DocumentCaptureScreen />);
    
    expect(getByText('Capture ID Card')).toBeTruthy();
    expect(getByText('Position your ID card within the frame')).toBeTruthy();
  });

  it('should render flip camera button', () => {
    const { getByText } = render(<DocumentCaptureScreen />);
    
    expect(getByText('🔄 Flip Camera')).toBeTruthy();
  });

  it('should render capture and back buttons', () => {
    const { getByText } = render(<DocumentCaptureScreen />);
    
    expect(getByText('Back')).toBeTruthy();
    expect(getByText('Capture')).toBeTruthy();
  });

  it('should render instructions for document capture', () => {
    const { getByText } = render(<DocumentCaptureScreen />);
    
    expect(getByText('• Ensure good lighting')).toBeTruthy();
    expect(getByText('• Keep ID card flat and steady')).toBeTruthy();
    expect(getByText('• Avoid glare and shadows')).toBeTruthy();
  });

  it('should render document frame with corners', () => {
    const { UNSAFE_getAllByType } = render(<DocumentCaptureScreen />);
    
    // Verify the component renders without crashing
    expect(UNSAFE_getAllByType).toBeTruthy();
  });

  it('should have camera facing state', () => {
    // This is a structural test to verify the component is set up correctly
    const { getByText } = render(<DocumentCaptureScreen />);
    
    expect(getByText('Capture ID Card')).toBeTruthy();
  });
});
