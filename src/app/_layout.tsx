import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="id-form" options={{ headerShown: false }} />
        <Stack.Screen name="document-capture" options={{ headerShown: false }} />
        <Stack.Screen name="face-capture" options={{ headerShown: false }} />
        <Stack.Screen name="verification" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
