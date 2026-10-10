import { StyleSheet } from 'react-native';

// Colors
export const colors = {
  background: '#1a1a1a',
  surface: '#2a2a2a',
  card: '#2a2a2a',
  primary: '#e13d3d', // Red wine
  primaryDark: '#c92a2a',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  text: '#ffffff',
  textSecondary: '#999999',
  textTertiary: '#666666',
  border: '#444444',
  borderLight: 'rgba(255, 255, 255, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border Radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Typography
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    color: colors.text,
  },
  bodySecondary: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 14,
    color: colors.textSecondary,
  },
};

// Common Styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 48,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  title: typography.h1,
  subtitle: {
    ...typography.bodySecondary,
    marginBottom: spacing.sm,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: typography.h3,
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSecondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonTextDisabled: {
    color: colors.textSecondary,
  },
});

// Camera specific styles
export const cameraStyles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    paddingTop: 48,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  cameraTitle: typography.h2,
  cameraSubtitle: {
    ...typography.bodySecondary,
    textAlign: 'center' as const,
  },
  flipButton: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: borderRadius.xl,
  },
  flipButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  captureButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  captureButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    paddingHorizontal: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center',
    padding: spacing.xxxl,
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center' as const,
    paddingBottom: 20,
    color: colors.text,
    fontSize: 16,
  },
});
