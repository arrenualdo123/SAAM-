import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BACKGROUND_COLOR, TEXT_COLOR, CARD_COLOR } from '../src/utils/constants';
import { useBLEConnection } from '../src/hooks/useBLEConnection';

const { width } = Dimensions.get('window');
const isWearOS = width < 300;

export default function SensorsScreen() {
  const router = useRouter();
  const { isConnected, sensorData } = useBLEConnection();
  const [activeTab, setActiveTab] = useState<'accel' | 'gyro'>('accel');

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notConnected}>
          <Text style={styles.notConnectedIcon}>⚠️</Text>
          <Text style={styles.notConnectedText}>No hay smartwatch conectado</Text>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => router.push('/connect')}
          >
            <Text style={styles.connectButtonText}>Conectar Ahora</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // WearOS Interface
  if (isWearOS) {
    return (
      <SafeAreaView style={styles.wearContainer}>
        <Text style={styles.wearTitle}>Sensores</Text>

        {sensorData.accelerometer ? (
          <View style={styles.wearSensorCard}>
            <Text style={styles.wearSensorTitle}>⚡ Acelerómetro</Text>
            <Text style={styles.wearSensorValue}>
              X: {sensorData.accelerometer.x.toFixed(2)}
            </Text>
            <Text style={styles.wearSensorValue}>
              Y: {sensorData.accelerometer.y.toFixed(2)}
            </Text>
            <Text style={styles.wearSensorValue}>
              Z: {sensorData.accelerometer.z.toFixed(2)}
            </Text>
          </View>
        ) : (
          <Text style={styles.wearNoData}>Sin datos</Text>
        )}

        <TouchableOpacity style={styles.wearBackButton} onPress={() => router.back()}>
          <Text style={styles.wearBackButtonText}>←</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Phone Interface
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Datos de Sensores</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accel' && styles.tabActive]}
          onPress={() => setActiveTab('accel')}
        >
          <Text style={[styles.tabText, activeTab === 'accel' && styles.tabTextActive]}>
            ⚡ Acelerómetro
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'gyro' && styles.tabActive]}
          onPress={() => setActiveTab('gyro')}
        >
          <Text style={[styles.tabText, activeTab === 'gyro' && styles.tabTextActive]}>
            🔄  Giroscopio
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'accel' && sensorData.accelerometer && (
          <View>
            <View style={styles.dataCard}>
              <Text style={styles.dataTitle}>📊 Valores actuales</Text>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Eje X:</Text>
                <Text style={styles.dataValue}>
                  {sensorData.accelerometer.x.toFixed(4)} m/s²
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Eje Y:</Text>
                <Text style={styles.dataValue}>
                  {sensorData.accelerometer.y.toFixed(4)} m/s²
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Eje Z:</Text>
                <Text style={styles.dataValue}>
                  {sensorData.accelerometer.z.toFixed(4)} m/s²
                </Text>
              </View>
              <View style={[styles.dataRow, styles.magnitudeRow]}>
                <Text style={styles.dataLabel}>Magnitud:</Text>
                <Text style={styles.magnitudeValue}>
                  {Math.sqrt(
                    Math.pow(sensorData.accelerometer.x, 2) +
                    Math.pow(sensorData.accelerometer.y, 2) +
                    Math.pow(sensorData.accelerometer.z, 2)
                  ).toFixed(4)} m/s²
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>ℹ️ Acelerómetro</Text>
              <Text style={styles.infoText}>
                El acelerómetro mide la aceleración del movimiento en tres ejes (X, Y, Z). 
                Es útil para detectar temblores, cambios bruscos de velocidad y patrones de movimiento 
                característicos del Parkinson.
              </Text>
              <View style={styles.infoDetail}>
                <Text style={styles.infoDetailLabel}>• Sensibilidad:</Text>
                <Text style={styles.infoDetailText}>Alta frecuencia (4-6 Hz)</Text>
              </View>
              <View style={styles.infoDetail}>
                <Text style={styles.infoDetailLabel}>• Uso:</Text>
                <Text style={styles.infoDetailText}>Detección de tremor en reposo</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'gyro' && sensorData.gyroscope && (
          <View>
            <View style={styles.dataCard}>
              <Text style={styles.dataTitle}>📊 Valores actuales</Text>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Eje X:</Text>
                <Text style={styles.dataValue}>
                  {sensorData.gyroscope.x.toFixed(4)} rad/s
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Eje Y:</Text>
                <Text style={styles.dataValue}>
                  {sensorData.gyroscope.y.toFixed(4)} rad/s
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Eje Z:</Text>
                <Text style={styles.dataValue}>
                  {sensorData.gyroscope.z.toFixed(4)} rad/s
                </Text>
              </View>
              <View style={[styles.dataRow, styles.magnitudeRow]}>
                <Text style={styles.dataLabel}>Velocidad angular:</Text>
                <Text style={styles.magnitudeValue}>
                  {Math.sqrt(
                    Math.pow(sensorData.gyroscope.x, 2) +
                    Math.pow(sensorData.gyroscope.y, 2) +
                    Math.pow(sensorData.gyroscope.z, 2)
                  ).toFixed(4)} rad/s
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>ℹ️ Giroscopio</Text>
              <Text style={styles.infoText}>
                El giroscopio mide la velocidad angular de rotación en tres ejes. 
                Detecta movimientos de giro, cambios de orientación y ayuda a identificar 
                bradicinesia (lentitud del movimiento) en pacientes con Parkinson.
              </Text>
              <View style={styles.infoDetail}>
                <Text style={styles.infoDetailLabel}>• Sensibilidad:</Text>
                <Text style={styles.infoDetailText}>Rotación angular</Text>
              </View>
              <View style={styles.infoDetail}>
                <Text style={styles.infoDetailLabel}>• Uso:</Text>
                <Text style={styles.infoDetailText}>Análisis de rigidez y bradicinesia</Text>
              </View>
            </View>
          </View>
        )}

        {!sensorData.accelerometer && !sensorData.gyroscope && (
          <View style={styles.noDataCard}>
            <Text style={styles.noDataIcon}>📡</Text>
            <Text style={styles.noDataText}>Esperando datos de sensores...</Text>
            <Text style={styles.noDataSubtext}>
              Asegúrate de que el smartwatch esté enviando información
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  // WearOS
  wearContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    padding: 15,
    justifyContent: 'space-between',
  },
  wearTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    textAlign: 'center',
  },
  wearSensorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
  },
  wearSensorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 10,
  },
  wearSensorValue: {
    fontSize: 12,
    color: TEXT_COLOR,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  wearNoData: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.6,
    textAlign: 'center',
  },
  wearBackButton: {
    backgroundColor: TEXT_COLOR,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  wearBackButtonText: {
    color: BACKGROUND_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Phone
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
  notConnected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notConnectedIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  notConnectedText: {
    fontSize: 18,
    color: TEXT_COLOR,
    textAlign: 'center',
    marginBottom: 30,
  },
  connectButton: {
    backgroundColor: TEXT_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  connectButtonText: {
    color: BACKGROUND_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: CARD_COLOR,
  },
  tabText: {
    color: TEXT_COLOR,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
  },
  tabTextActive: {
    opacity: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dataCard: {
    backgroundColor: CARD_COLOR,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 15,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(248, 247, 244, 0.1)',
  },
  magnitudeRow: {
    borderBottomWidth: 0,
    paddingTop: 15,
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: 'rgba(248, 247, 244, 0.2)',
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_COLOR,
  },
  dataValue: {
    fontSize: 16,
    color: TEXT_COLOR,
    fontFamily: 'monospace',
  },
  magnitudeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6BCF7F',
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: TEXT_COLOR,
    lineHeight: 22,
    opacity: 0.8,
    marginBottom: 15,
  },
  infoDetail: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginRight: 8,
  },
  infoDetailText: {
    fontSize: 14,
    color: TEXT_COLOR,
    opacity: 0.7,
    flex: 1,
  },
  noDataCard: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 10,
  },
  noDataSubtext: {
    fontSize: 14,
    color: TEXT_COLOR,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});