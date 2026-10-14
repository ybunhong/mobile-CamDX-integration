import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, commonStyles, spacing } from '../theme';
import { FormErrors } from '../types/didit';
import {
  sanitizeInput,
  sanitizeUserInfo,
  validateDateFormat,
  validateGender,
  validateIdNumber,
  validateName,
} from '../utils/security';

export default function IdCardForm() {
  const [userInfo, setUserInfo] = useState<DiditUserInfo>({
    idNumber: '',
    firstNameKh: '',
    lastNameKh: '',
    firstNameEn: '',
    lastNameEn: '',
    gender: 'M',
    dob: '',
    issuedDate: '',
    expiredDate: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateIdNumber(userInfo.idNumber)) {
      newErrors.idNumber = 'ID number must be exactly 9 digits';
    }
    if (!validateName(userInfo.firstNameKh)) {
      newErrors.firstNameKh = 'First name in Khmer is required';
    }
    if (!validateName(userInfo.lastNameKh)) {
      newErrors.lastNameKh = 'Last name in Khmer is required';
    }
    if (!validateName(userInfo.firstNameEn)) {
      newErrors.firstNameEn = 'First name in English is required';
    }
    if (!validateName(userInfo.lastNameEn)) {
      newErrors.lastNameEn = 'Last name in English is required';
    }
    if (!validateDateFormat(userInfo.dob)) {
      newErrors.dob = 'Date of birth must be in YYYY-MM-DD format';
    }
    if (!validateDateFormat(userInfo.issuedDate)) {
      newErrors.issuedDate = 'Issued date must be in YYYY-MM-DD format';
    }
    if (!validateDateFormat(userInfo.expiredDate)) {
      newErrors.expiredDate = 'Expired date must be in YYYY-MM-DD format';
    }
    if (!validateGender(userInfo.gender)) {
      newErrors.gender = 'Gender must be M or F';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Sanitize user info before sending
      const sanitizedUserInfo = sanitizeUserInfo(userInfo);
      router.push({
        pathname: '/face-capture',
        params: { userInfo: JSON.stringify(sanitizedUserInfo) },
      });
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
    }
  };

  const handleAutoFill = () => {
    const mockDataOptions: DiditUserInfo[] = [
      {
        idNumber: '011196245',
        firstNameKh: 'ការឌុល',
        lastNameKh: 'អេង',
        firstNameEn: 'KADOL',
        lastNameEn: 'ENG',
        gender: 'M',
        dob: '2000-05-06',
        issuedDate: '2016-03-23',
        expiredDate: '2026-03-22',
      },
      {
        idNumber: '023456789',
        firstNameKh: 'សុខ',
        lastNameKh: 'មុន្នី',
        firstNameEn: 'SOKH',
        lastNameEn: 'MUNY',
        gender: 'F',
        dob: '1995-08-15',
        issuedDate: '2018-07-10',
        expiredDate: '2028-07-09',
      },
      {
        idNumber: '034567890',
        firstNameKh: 'វិច្ឆិ',
        lastNameKh: 'គង់',
        firstNameEn: 'VICHHEA',
        lastNameEn: 'KONG',
        gender: 'M',
        dob: '1992-12-20',
        issuedDate: '2015-11-15',
        expiredDate: '2025-11-14',
      },
    ];

    const randomMockData = mockDataOptions[Math.floor(Math.random() * mockDataOptions.length)];
    setUserInfo(randomMockData);
    setErrors({});
    Alert.alert('Auto-filled', 'Form has been populated with mock Cambodian citizen data');
  };

  const updateField = (field: keyof CamDigiKeyUserInfo, value: string) => {
    // Sanitize input on change
    const sanitizedValue = sanitizeInput(value);
    setUserInfo(prev => ({ ...prev, [field]: sanitizedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>Identity Information</Text>
        <Text style={commonStyles.subtitle}>Enter your ID card details as they appear on your card</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>ID Number *</Text>
          <TextInput
            style={[commonStyles.input, errors.idNumber && commonStyles.inputError]}
            placeholder="9-digit ID number"
            placeholderTextColor={colors.textSecondary}
            value={userInfo.idNumber}
            onChangeText={(value) => updateField('idNumber', value)}
            keyboardType="numeric"
            maxLength={9}
          />
          {errors.idNumber && <Text style={commonStyles.errorText}>{errors.idNumber}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>First Name (Khmer) *</Text>
          <TextInput
            style={[commonStyles.input, errors.firstNameKh && commonStyles.inputError]}
            placeholder="ឈ្មោះ"
            placeholderTextColor={colors.textSecondary}
            value={userInfo.firstNameKh}
            onChangeText={(value) => updateField('firstNameKh', value)}
          />
          {errors.firstNameKh && <Text style={commonStyles.errorText}>{errors.firstNameKh}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Last Name (Khmer) *</Text>
          <TextInput
            style={[commonStyles.input, errors.lastNameKh && commonStyles.inputError]}
            placeholder="គោត្រនាម"
            placeholderTextColor={colors.textSecondary}
            value={userInfo.lastNameKh}
            onChangeText={(value) => updateField('lastNameKh', value)}
          />
          {errors.lastNameKh && <Text style={commonStyles.errorText}>{errors.lastNameKh}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>First Name (English) *</Text>
          <TextInput
            style={[commonStyles.input, errors.firstNameEn && commonStyles.inputError]}
            placeholder="First Name"
            placeholderTextColor={colors.textSecondary}
            value={userInfo.firstNameEn}
            onChangeText={(value) => updateField('firstNameEn', value)}
            autoCapitalize="words"
          />
          {errors.firstNameEn && <Text style={commonStyles.errorText}>{errors.firstNameEn}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Last Name (English) *</Text>
          <TextInput
            style={[commonStyles.input, errors.lastNameEn && commonStyles.inputError]}
            placeholder="Last Name"
            placeholderTextColor={colors.textSecondary}
            value={userInfo.lastNameEn}
            onChangeText={(value) => updateField('lastNameEn', value)}
            autoCapitalize="words"
          />
          {errors.lastNameEn && <Text style={commonStyles.errorText}>{errors.lastNameEn}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderButton, userInfo.gender === 'M' && styles.genderButtonActive]}
              onPress={() => updateField('gender', 'M')}
            >
              <Text style={[styles.genderText, userInfo.gender === 'M' && styles.genderTextActive]}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, userInfo.gender === 'F' && styles.genderButtonActive]}
              onPress={() => updateField('gender', 'F')}
            >
              <Text style={[styles.genderText, userInfo.gender === 'F' && styles.genderTextActive]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date of Birth *</Text>
          <TextInput
            style={[commonStyles.input, errors.dob && commonStyles.inputError]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={userInfo.dob}
            onChangeText={(value) => updateField('dob', value)}
          />
          {errors.dob && <Text style={commonStyles.errorText}>{errors.dob}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Issued Date *</Text>
          <TextInput
            style={[commonStyles.input, errors.issuedDate && commonStyles.inputError]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={userInfo.issuedDate}
            onChangeText={(value) => updateField('issuedDate', value)}
          />
          {errors.issuedDate && <Text style={commonStyles.errorText}>{errors.issuedDate}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Expired Date *</Text>
          <TextInput
            style={[commonStyles.input, errors.expiredDate && commonStyles.inputError]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={userInfo.expiredDate}
            onChangeText={(value) => updateField('expiredDate', value)}
          />
          {errors.expiredDate && <Text style={commonStyles.errorText}>{errors.expiredDate}</Text>}
        </View>

        <TouchableOpacity style={styles.autoFillButton} onPress={handleAutoFill}>
          <Text style={styles.autoFillButtonText}>Auto-Fill Mock Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={commonStyles.button} onPress={handleSubmit}>
          <Text style={commonStyles.buttonText}>Continue to Document Capture</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  field: {
    marginBottom: spacing.xl,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  genderButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  genderTextActive: {
    color: colors.text,
  },
  autoFillButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.success,
  },
  autoFillButtonText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '600',
  },
});
