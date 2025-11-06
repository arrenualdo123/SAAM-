import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#89C2AF',
          },
        }}
      >
        <Stack.Screen 
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Stack.Screen 
          name="dashboard"
          options={{
            title: 'Dashboard',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}