import { router } from 'expo-router';
import IdCardForm from '../../components/IdCardForm';
import type { UserInfo } from '../../types/identity';

export default function EnrollIdFormScreen() {
  const handleSubmit = (info: UserInfo) => {
    router.push({
      pathname: '/enroll/document-capture',
      params: { userInfo: JSON.stringify(info) },
    });
  };

  return <IdCardForm onSubmit={handleSubmit} />;
}
