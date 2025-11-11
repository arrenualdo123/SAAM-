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

const { width } = Dimensions.get('window');
const isWearOS = width < 300;

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {isWearOS ? (
        <View style={styles.wearContainer}>
          <Text style={styles.wearBrainIcon}>🧠</Text>
          <Text style={styles.wearAppName}>Parkinson</Text>
          
          <TouchableOpacity
            style={styles.wearButton}
            onPress={() => router.push('/dashboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.wearButtonText}>Ir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.phoneContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.brainIcon}>🧠</Text>
            </View>
            <Text style={styles.appName}>Parkinson Detector</Text>
            <Text style={styles.subtitle}>Monitoreo de tremor en tiempo real</Text>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/dashboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Comenzar</Text>
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
  phoneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_COLOR,
    opacity: 0.8,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: TEXT_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: BACKGROUND_COLOR,
    fontSize: 18,
    fontWeight: 'bold',
  },
});