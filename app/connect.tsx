// app/connect.tsx - Pantalla para conectar el smartwatch

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BACKGROUND_COLOR, TEXT_COLOR, CARD_COLOR } from '../src/utils/constants';
import { useBLEConnection } from '../src/hooks/useBLEConnection';

export default function ConnectWatchScreen() {
  const router = useRouter();
  const {
    isScanning,
    isConnected,
    availableDevices,
    connectedDevice,
    batteryLevel,
    error,
    scanDevices,
    connectToDevice,
    disconnect,
  } = useBLEConnection();

  const getSignalStrength = (rssi: number) => {
    if (rssi > -60) return { icon: '▂▃▅▇', text: 'Excelente', color: '#6BCF7F' };
    if (rssi > -75) return { icon: '▂▃▅', text: 'Buena', color: '#FFD93D' };
    if (rssi > -90) return { icon: '▂▃', text: 'Regular', color: '#FFA726' };
    return { icon: '▂', text: 'Débil', color: '#FF6B6B' };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Conectar Smartwatch</Text>
      </View>

      {/* Estado de conexión */}
      {isConnected && connectedDevice ? (
        <View style={styles.connectedCard}>
          <View style={styles.connectedHeader}>
            <Text style={styles.connectedIcon}>✅</Text>
            <View>
              <Text style={styles.connectedTitle}>Conectado</Text>
              <Text style={styles.connectedDevice}>{connectedDevice.name}</Text>
            </View>
          </View>

          <View style={styles.connectedStats}>
            {batteryLevel !== null && (
              <View style={styles.stat}>
                <Text style={styles.statIcon}>🔋</Text>
                <Text style={styles.statText}>Batería: {batteryLevel}%</Text>
              </View>
            )}
            <View style={styles.stat}>
              <Text style={styles.statIcon}>📡</Text>
              <Text style={styles.statText}>
                Señal: {getSignalStrength(connectedDevice.rssi).text}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/realtime')}
          >
            <Text style={styles.startButtonText}>📊 Iniciar Monitoreo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
            <Text style={styles.disconnectButtonText}>Desconectar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Botón de escaneo */}
          <View style={styles.scanSection}>
            <Text style={styles.sectionTitle}>
              {availableDevices.length === 0
                ? '🔍 Buscar dispositivos cercanos'
                : `📱 ${availableDevices.length} dispositivo(s) encontrado(s)`}
            </Text>

            <TouchableOpacity
              style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
              onPress={scanDevices}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator color={BACKGROUND_COLOR} />
              ) : (
                <Text style={styles.scanButtonText}>
                  {availableDevices.length === 0 ? 'Buscar' : 'Buscar de nuevo'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Lista de dispositivos */}
          <ScrollView style={styles.devicesList}>
            {availableDevices.map((device) => {
              const signal = getSignalStrength(device.rssi);
              return (
                <TouchableOpacity
                  key={device.id}
                  style={styles.deviceCard}
                  onPress={() => connectToDevice(device.id)}
                >
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceIcon}>⌚</Text>
                    <View style={styles.deviceDetails}>
                      <Text style={styles.deviceName}>{device.name || 'Desconocido'}</Text>
                      <Text style={styles.deviceSignal}>
                        {signal.icon} {signal.text}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.connectText}>Conectar →</Text>
                </TouchableOpacity>
              );
            })}

            {availableDevices.length === 0 && !isScanning && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📡</Text>
                <Text style={styles.emptyText}>No se encontraron dispositivos</Text>
                <Text style={styles.emptySubtext}>
                  Asegúrate de que tu smartwatch esté encendido y con Bluetooth activado
                </Text>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Instrucciones */}
      {!isConnected && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>💡 Instrucciones:</Text>
          <Text style={styles.instructionsText}>
            1. Enciende el Bluetooth en tu smartwatch
          </Text>
          <Text style={styles.instructionsText}>
            2. Mantén el reloj cerca del teléfono
          </Text>
          <Text style={styles.instructionsText}>
            3. Presiona "Buscar" para escanear dispositivos
          </Text>
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
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(248, 247, 244, 0.2)',
  },
  backText: {
    color: TEXT_COLOR,
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  connectedCard: {
    backgroundColor: CARD_COLOR,
    margin: 20,
    padding: 25,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#6BCF7F',
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  connectedIcon: {
    fontSize: 40,
  },
  connectedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  connectedDevice: {
    fontSize: 14,
    color: TEXT_COLOR,
    opacity: 0.8,
    marginTop: 5,
  },
  connectedStats: {
    gap: 12,
    marginBottom: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIcon: {
    fontSize: 18,
  },
  statText: {
    fontSize: 14,
    color: TEXT_COLOR,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#6BCF7F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disconnectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  disconnectButtonText: {
    color: TEXT_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  scanSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: TEXT_COLOR,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonText: {
    color: BACKGROUND_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  devicesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  deviceCard: {
    backgroundColor: CARD_COLOR,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  deviceIcon: {
    fontSize: 32,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 5,
  },
  deviceSignal: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.7,
  },
  connectText: {
    fontSize: 14,
    color: TEXT_COLOR,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: TEXT_COLOR,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: '#FF6B6B',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorIcon: {
    fontSize: 24,
  },
  errorText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  instructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: TEXT_COLOR,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  },
});