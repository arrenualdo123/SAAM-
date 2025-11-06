import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BACKGROUND_COLOR, TEXT_COLOR } from '../src/utils/constants';

const { width, height } = Dimensions.get('window');
const isWearOS = width < 300; // Detecta si es reloj

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {isWearOS ? (
        // LAYOUT PARA WEAR OS (reloj pequeño)
        <View style={styles.wearContainer}>
          <Text style={styles.wearBrainIcon}>🧠</Text>
          <Text style={styles.wearAppName}>Parkinson</Text>
          
          <TouchableOpacity
            style={styles.wearButton}
            onPress={() => router.navigate('/dashboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.wearButtonText}>Ir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // LAYOUT PARA TELÉFONO
        <View style={styles.phoneContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.brainIcon}>🧠</Text>
            </View>
            <Text style={styles.appName}>Parkinson Detector</Text>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.navigate('/dashboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Ir a Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },

  // WEAR OS STYLES
  wearContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
  },
  wearBrainIcon: {
    fontSize: 50,
    marginBottom: 5,
  },
  wearAppName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    textAlign: 'center',
  },
  wearButton: {
    backgroundColor: TEXT_COLOR,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wearButtonText: {
    color: BACKGROUND_COLOR,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // PHONE STYLES
  phoneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 140,
    height: 140,
    borderRadius: 30,
    backgroundColor: TEXT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  brainIcon: {
    fontSize: 70,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  startButton: {
    backgroundColor: TEXT_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    elevation: 3,
  },
  startButtonText: {
    color: BACKGROUND_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
});