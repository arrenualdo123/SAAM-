import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BACKGROUND_COLOR, TEXT_COLOR, CARD_COLOR } from '../src/utils/constants';
import { useBLEConnection } from '../src/hooks/useBLEConnection';
import { useTremorSession } from '../src/hooks/useTremorSession';
import Svg, { Polyline } from 'react-native-svg';

export default function RealtimeScreen() {
  const router = useRouter();
  const { isConnected, connectedDevice, sensorData, disconnect } = useBLEConnection();
  const {
    isActive,
    sessionData,
    tremorIndex,
    startSession,
    stopSession,
    addReading,
  } = useTremorSession();

  const [graphData, setGraphData] = useState<number[]>([]);
  const [duration, setDuration] = useState(0);

  // Verificar conexión
  useEffect(() => {
    if (!isConnected) {
      Alert.alert(
        'Sin conexión',
        'No hay smartwatch conectado',
        [{ text: 'Conectar', onPress: () => router.replace('/connect') }]
      );
    }
  }, [isConnected]);

  // Procesar datos de sensores
  useEffect(() => {
    if (isActive && sensorData.accelerometer) {
      const { x, y, z } = sensorData.accelerometer;
      addReading(x, y, z);

      // Actualizar gráfico
      setGraphData((prev) => [...prev, tremorIndex].slice(-50));
    }
  }, [sensorData, isActive]);

  // Contador de duración
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTremorColor = () => {
    if (tremorIndex > 66) return '#FF6B6B';
    if (tremorIndex > 33) return '#FFD93D';
    return '#6BCF7F';
  };

  const getTremorStatus = () => {
    if (tremorIndex > 66) return 'Alto';
    if (tremorIndex > 33) return 'Moderado';
    return 'Bajo';
  };

  const generatePath = () => {
    if (graphData.length < 2) return '';
    
    const chartWidth = 300;
    const chartHeight = 120;
    const xStep = chartWidth / (graphData.length - 1);
    
    return graphData
      .map((value, index) => {
        const x = index * xStep;
        const y = chartHeight - (value / 100) * chartHeight;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const handleStart = () => {
    startSession();
    setDuration(0);
    setGraphData([]);
  };

  const handleStop = async () => {
    const session = await stopSession();
    if (session) {
      Alert.alert(
        '✅ Sesión Guardada',
        `Duración: ${formatDuration(session.duration)}\nÍndice: ${session.tremorIndex}% (${session.tremorStatus})`,
        [
          {
            text: 'Ver Historial',
            onPress: () => router.push('/history'),
          },
          { text: 'OK' },
        ]
      );
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Monitoreo en Vivo</Text>
        </View>

        {/* Estado de conexión */}
        <View style={styles.connectionCard}>
          <Text style={styles.connectionIcon}>⌚</Text>
          <Text style={styles.connectionText}>{connectedDevice?.name}</Text>
          <Text style={styles.connectionStatus}>Conectado</Text>
        </View>

        {/* Gráfico en tiempo real */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📊 Índice de Tremor</Text>
          <View style={styles.chartContainer}>
            {graphData.length > 0 ? (
              <Svg width={300} height={120}>
                <Polyline
                  points={generatePath()}
                  fill="none"
                  stroke={getTremorColor()}
                  strokeWidth="3"
                />
              </Svg>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  {isActive ? 'Recopilando datos...' : 'Presiona Iniciar'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Métricas actuales */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{tremorIndex}%</Text>
            <Text style={styles.metricLabel}>Índice</Text>
            <View
              style={[
                styles.metricBadge,
                { backgroundColor: getTremorColor() },
              ]}
            >
              <Text style={styles.metricBadgeText}>{getTremorStatus()}</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{formatDuration(duration)}</Text>
            <Text style={styles.metricLabel}>Duración</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{sessionData.length}</Text>
            <Text style={styles.metricLabel}>Lecturas</Text>
          </View>
        </View>

        {/* Datos de sensores */}
        {sensorData.accelerometer && (
          <View style={styles.sensorCard}>
            <Text style={styles.sensorTitle}>⚡ Acelerómetro</Text>
            <View style={styles.sensorData}>
              <Text style={styles.sensorValue}>
                X: {sensorData.accelerometer.x.toFixed(3)}
              </Text>
              <Text style={styles.sensorValue}>
                Y: {sensorData.accelerometer.y.toFixed(3)}
              </Text>
              <Text style={styles.sensorValue}>
                Z: {sensorData.accelerometer.z.toFixed(3)}
              </Text>
            </View>
          </View>
        )}

        {sensorData.gyroscope && (
          <View style={styles.sensorCard}>
            <Text style={styles.sensorTitle}>🔄 Giroscopio</Text>
            <View style={styles.sensorData}>
              <Text style={styles.sensorValue}>
                X: {sensorData.gyroscope.x.toFixed(3)}
              </Text>
              <Text style={styles.sensorValue}>
                Y: {sensorData.gyroscope.y.toFixed(3)}
              </Text>
              <Text style={styles.sensorValue}>
                Z: {sensorData.gyroscope.z.toFixed(3)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botones de control */}
      <View style={styles.controlsContainer}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>▶️ Iniciar Monitoreo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <Text style={styles.stopButtonText}>⏹️ Detener y Guardar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scrollContent: {
    paddingBottom: 100,
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
  connectionCard: {
    backgroundColor: CARD_COLOR,
    margin: 20,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connectionIcon: {
    fontSize: 24,
  },
  connectionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_COLOR,
  },
  connectionStatus: {
    fontSize: 12,
    color: '#6BCF7F',
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: CARD_COLOR,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 15,
  },
  chartContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: TEXT_COLOR,
    opacity: 0.6,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: CARD_COLOR,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.7,
    marginBottom: 8,
  },
  metricBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metricBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  sensorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  sensorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 10,
  },
  sensorData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sensorValue: {
    fontSize: 12,
    color: TEXT_COLOR,
    fontFamily: 'monospace',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: BACKGROUND_COLOR,
    borderTopWidth: 1,
    borderTopColor: 'rgba(248, 247, 244, 0.2)',
  },
  startButton: {
    backgroundColor: '#6BCF7F',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});