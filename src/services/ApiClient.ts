import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { Enrollment } from '../types/identity';

/**
 * Resolve the local server without hard-coding an IP:
 * - web:          http://localhost:3001
 * - Android emu:  http://10.0.2.2:3001 (host loopback alias)
 * - phone:        http://<expo hostUri>:3001 (same LAN as the packager)
 */
function resolveBaseUrl(): string {
  if (Platform.OS === 'web') return 'http://localhost:3001';

  const hostUri =
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ?? '';
  const host = String(hostUri).split(':')[0];

  if (Platform.OS === 'android' && (!host || host === 'localhost' || host === '127.0.0.1')) {
    return 'http://10.0.2.2:3001';
  }
  return host ? `http://${host}:3001` : 'http://localhost:3001';
}

export const API_BASE_URL = resolveBaseUrl();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Server error ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}

export type EnrollmentPayload = Omit<Enrollment, 'createdAt'>;

export const apiClient = {
  /**
   * Creates or replaces the enrolment for this ID number. `replaced` is true
   * when a record with the same ID number already existed.
   */
  enroll(payload: EnrollmentPayload) {
    return request<{ ok: true; enrollment: Enrollment; replaced: boolean }>('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listEnrollments() {
    return request<Enrollment[]>('/api/enrollments');
  },

  removeEnrollment(idNumber: string) {
    return request<{ ok: true }>(`/api/enrollments/${encodeURIComponent(idNumber)}`, {
      method: 'DELETE',
    });
  },

  health() {
    return request<{ ok: boolean; count: number }>('/health');
  },
};
