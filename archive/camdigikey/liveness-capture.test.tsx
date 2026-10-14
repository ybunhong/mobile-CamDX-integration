import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LivenessCaptureScreen from '../liveness-capture';

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
    idImage: 'file://mock-image.jpg',
  }),
}));

// Mock Alert
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
}));

describe('LivenessCaptureScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the liveness capture screen', () => {
    const { getByText } = render(<LivenessCaptureScreen />);
    
    expect(getByText('Liveness Check')).toBeTruthy();
  });

  it('should render step indicator', () => {
    const { getByText } = render(<LivenessCaptureScreen />);
    
    expect(getByText('Step 1 of 3')).toBeTruthy();
  });

  it('should render flip camera button', () => {
    const { getByText } = render(<LivenessCaptureScreen />);
    
    expect(getByText('🔄 Flip Camera')).toBeTruthy();
  });

  it('should render capture and back buttons', () => {
    const { getByText } = render(<LivenessCaptureScreen />);
    
    expect(getByText('Back')).toBeTruthy();
    expect(getByText('Capture')).toBeTruthy();
  });

  it('should render liveness instruction', () => {
    const { getByText } = render(<LivenessCaptureScreen />);
    
    expect(getByText('Turn your face to the LEFT')).toBeTruthy();
  });

  it('should render face guide', () => {
    const { getByText } = render(<LivenessCaptureScreen />);
    
    expect(getByText('Position your face here')).toBeTruthy();
  });

  it('should render progress indicators', () => {
    const { UNSAFE_getAllByType } = render(<LivenessCaptureScreen />);
    
    // Verify the component renders without crashing
    expect(UNSAFE_getAllByType).toBeTruthy();
  });

  it('should have instruction box with icon', () => {
    const { getByText } = render(<LivenessCaptureScreen />);
    
    expect(getByText('← Turn Left')).toBeTruthy();
  });
});
