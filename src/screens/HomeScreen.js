import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { BACKGROUND_COLOR, TEXT_COLOR } from '../utils/constants';

export default function HomeScreen({ onNavigate }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.brainIcon}>🧠</Text>
        </View>
        <Text style={styles.appName}>Parkinson Detector</Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={onNavigate}>
        <Text style={styles.startButtonText}>Ir a Dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: BACKGROUND_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
});