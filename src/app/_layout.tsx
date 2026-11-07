import { Observe, ObserveRoot } from 'expo-observe';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

Observe.configure({ integrations: { 'expo-router': true } });

function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default ObserveRoot.wrap(RootLayout);
