import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BACKGROUND_COLOR, TEXT_COLOR, CARD_COLOR } from '../src/utils/constants';
import { useTremorSession } from '../src/hooks/useTremorSession';

const { width } = Dimensions.get('window');
const isWearOS = width < 300;

export default function DashboardScreen() {
  const router = useRouter();
  const [time, setTime] = useState('12:50');
  const [activeTab, setActiveTab] = useState(0);
  
  // ✅ Usar el hook personalizado
  const {
    isActive,
    sessionData,
    tremorIndex,
    startSession,
    stopSession,
    addReading,
  } = useTremorSession();

  // Actualizar tiempo cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);

      // ✅ Simular datos de sensores (reemplazar con sensores reales)
      if (isActive) {
        const x = (Math.random() - 0.5) * 2;
        const y = (Math.random() - 0.5) * 2;
        const z = (Math.random() - 0.5) * 2;
        addReading(x, y, z);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const [hour, minute] = time.split(':');

  const getTremorColor = () => {
    if (tremorIndex > 66) return '#ff6b6b';
    if (tremorIndex > 33) return '#ffd93d';
    return '#6bcf7f';
  };

  const getTremorStatus = () => {
    if (tremorIndex > 66) return 'Alto';
    if (tremorIndex > 33) return 'Moderado';
    return 'Bajo';
  };

  // ✅ Manejar inicio de sesión
  const handleStartSession = () => {
    startSession();
    Alert.alert('✅ Sesión iniciada', 'Monitoreando tremor...');
  };

  // ✅ Manejar fin de sesión
  const handleStopSession = async () => {
    Alert.alert(
      '💾 Guardar Sesión',
      '¿Deseas guardar esta sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Guardar',
          onPress: async () => {
            const session = await stopSession();
            if (session) {
              Alert.alert(
                '✅ Sesión Guardada',
                `Índice: ${session.tremorIndex}% (${session.tremorStatus})\nDuración: ${Math.floor(session.duration / 60)}:${String(session.duration % 60).padStart(2, '0')}`,
                [
                  {
                    text: 'Ver Historial',
                    onPress: () => router.push('/history'),
                  },
                  {
                    text: 'OK',
                  },
                ]
              );
            }
          },
        },
      ]
    );
  };

  const getDotStyle = (index: number) => {
    const baseStyle = styles.wearDot;
    if (activeTab === index) {
      return [baseStyle, styles.wearDotActive];
    }
    return [baseStyle, styles.wearDotInactive];
  };

  // ========== INTERFAZ WEAR OS ==========
  if (isWearOS) {
    return (
      <SafeAreaView style={styles.wearContainer}>
        {activeTab === 0 && (
          <View style={styles.wearMetricsView}>
            <Text style={styles.wearTime}>{hour}:{minute}</Text>
            
            <View style={styles.wearTremorBox}>
              <Text style={styles.wearTremorLabel}>Tremor</Text>
              <Text style={styles.wearTremorValue}>{tremorIndex}%</Text>
              <View style={styles.wearProgressBar}>
                <View
                  style={[
                    styles.wearProgressFill,
                    { width: `${tremorIndex}%`, backgroundColor: getTremorColor() },
                  ]}
                />
              </View>
            </View>

            {/* ✅ Botón de control de sesión */}
            <TouchableOpacity
              style={[
                styles.wearSessionButton,
                isActive && styles.wearSessionButtonActive,
              ]}
              onPress={isActive ? handleStopSession : handleStartSession}
            >
              <Text style={styles.wearSessionButtonText}>
                {isActive ? '⏹️ Detener' : '▶️ Iniciar'}
              </Text>
            </TouchableOpacity>

            <View style={styles.wearTabIndicators}>
              <TouchableOpacity style={getDotStyle(0)} onPress={() => setActiveTab(0)} />
              <TouchableOpacity style={getDotStyle(1)} onPress={() => setActiveTab(1)} />
              <TouchableOpacity style={getDotStyle(2)} onPress={() => setActiveTab(2)} />
            </View>

            <TouchableOpacity style={styles.wearBackButton} onPress={() => router.back()}>
              <Text style={styles.wearBackButtonText}>←</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 1 && (
          <View style={styles.wearMetricsView}>
            <Text style={styles.wearTabTitle}>Índice</Text>
            <View style={styles.wearIndexCard}>
              <Text style={styles.wearIndexValue}>{tremorIndex}%</Text>
              <Text style={[styles.wearIndexStatus, { color: getTremorColor() }]}>
                {getTremorStatus()}
              </Text>
            </View>
            <Text style={styles.wearSmallText}>Rango: 4-6 Hz</Text>
            <Text style={styles.wearSmallText}>
              {isActive ? `📊 ${sessionData.length} lecturas` : 'Sesión detenida'}
            </Text>
            
            <View style={styles.wearTabIndicators}>
              <TouchableOpacity style={getDotStyle(0)} onPress={() => setActiveTab(0)} />
              <TouchableOpacity style={getDotStyle(1)} onPress={() => setActiveTab(1)} />
              <TouchableOpacity style={getDotStyle(2)} onPress={() => setActiveTab(2)} />
            </View>

            <TouchableOpacity style={styles.wearBackButton} onPress={() => router.back()}>
              <Text style={styles.wearBackButtonText}>←</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 2 && (
          <View style={styles.wearMetricsView}>
            <Text style={styles.wearTabTitle}>Acciones</Text>
            
            <TouchableOpacity
              style={styles.wearActionButton}
              onPress={() => router.push('/history')}
            >
              <Text style={styles.wearActionButtonText}>📊</Text>
              <Text style={styles.wearActionButtonLabel}>Historial</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.wearActionButton,
                isActive && styles.wearActionButtonDisabled,
              ]}
              onPress={handleStartSession}
              disabled={isActive}
            >
              <Text style={styles.wearActionButtonText}>▶️</Text>
              <Text style={styles.wearActionButtonLabel}>
                {isActive ? 'En sesión' : 'Nueva sesión'}
              </Text>
            </TouchableOpacity>

            <View style={styles.wearTabIndicators}>
              <TouchableOpacity style={getDotStyle(0)} onPress={() => setActiveTab(0)} />
              <TouchableOpacity style={getDotStyle(1)} onPress={() => setActiveTab(1)} />
              <TouchableOpacity style={getDotStyle(2)} onPress={() => setActiveTab(2)} />
            </View>

            <TouchableOpacity style={styles.wearBackButton} onPress={() => router.back()}>
              <Text style={styles.wearBackButtonText}>←</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ========== INTERFAZ TELÉFONO ==========
  return (
    <SafeAreaView style={styles.phoneContainer}>
      <View style={styles.mainContent}>
        <View style={styles.timeCardWrapper}>
          <View style={styles.timeCard}>
            <View style={styles.timeDisplay}>
              <Text style={styles.timeHour}>{hour}</Text>
              <Text style={styles.timeDot}>:</Text>
              <Text style={styles.timeMinute}>{minute}</Text>
            </View>
            
            {/* ✅ Indicador de estado */}
            {isActive && (
              <View style={styles.activeIndicator}>
                <View style={styles.activeBlinkDot} />
                <Text style={styles.activeText}>Monitoreando</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <Text style={styles.metricIcon}>📊</Text>
            <Text style={styles.metricText}>Tremor: {tremorIndex}%</Text>
          </View>
          <View
            style={[
              styles.metricStatusBadge,
              { backgroundColor: getTremorColor() },
            ]}
          >
            <Text style={styles.metricStatusText}>{getTremorStatus()}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricIcon}>⏱️</Text>
            <Text style={styles.metricText}>
              {isActive ? `${sessionData.length} lecturas` : 'Detenido'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricIcon}>🎯</Text>
            <Text style={styles.metricText}>Rango: 4-6 Hz</Text>
          </View>
        </View>
      </View>

      <View style={styles.phoneActions}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
            <Text style={styles.startButtonText}>▶️ Iniciar Sesión</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStopSession}>
            <Text style={styles.stopButtonText}>⏹️ Detener y Guardar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/history')}
        >
          <Text style={styles.historyButtonText}>📊 Ver Historial</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ========== WEAR OS STYLES ==========
  wearContainer: { flex: 1, backgroundColor: BACKGROUND_COLOR },
  wearMetricsView: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 12,
  },
  wearTime: {
    fontSize: 40,
    fontWeight: '300',
    color: TEXT_COLOR,
    letterSpacing: -1,
  },
  wearTabTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 10,
  },
  wearTremorBox: { alignItems: 'center', marginVertical: 10 },
  wearTremorLabel: { fontSize: 12, color: TEXT_COLOR, opacity: 0.7 },
  wearTremorValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginVertical: 5,
  },
  wearProgressBar: {
    width: 80,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  wearProgressFill: { height: '100%', borderRadius: 3 },
  wearSessionButton: {
    backgroundColor: TEXT_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  wearSessionButtonActive: {
    backgroundColor: '#ff6b6b',
  },
  wearSessionButtonText: {
    color: BACKGROUND_COLOR,
    fontSize: 12,
    fontWeight: 'bold',
  },
  wearIndexCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
  },
  wearIndexValue: { fontSize: 36, fontWeight: 'bold', color: TEXT_COLOR },
  wearIndexStatus: { fontSize: 14, fontWeight: '600', marginTop: 5 },
  wearSmallText: {
    fontSize: 11,
    color: TEXT_COLOR,
    opacity: 0.6,
    marginTop: 4,
  },
  wearActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  wearActionButtonDisabled: {
    opacity: 0.5,
  },
  wearActionButtonText: {
    fontSize: 24,
  },
  wearActionButtonLabel: {
    fontSize: 10,
    color: TEXT_COLOR,
    marginTop: 4,
    fontWeight: '600',
  },
  wearTabIndicators: { flexDirection: 'row', gap: 6, marginVertical: 10 },
  wearDot: { width: 6, height: 6, borderRadius: 3 },
  wearDotActive: { backgroundColor: TEXT_COLOR },
  wearDotInactive: { backgroundColor: 'rgba(248, 247, 244, 0.3)' },
  wearBackButton: {
    backgroundColor: TEXT_COLOR,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wearBackButtonText: {
    color: BACKGROUND_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ========== PHONE STYLES ==========
  phoneContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    padding: 20,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 30,
    paddingTop: 60,
  },
  timeCardWrapper: { justifyContent: 'center' },
  timeCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 24,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 200,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeHour: {
    fontSize: 72,
    fontWeight: '300',
    color: TEXT_COLOR,
    letterSpacing: -2,
    lineHeight: 80,
  },
  timeDot: {
    fontSize: 60,
    color: TEXT_COLOR,
    fontWeight: '300',
    paddingHorizontal: 5,
    lineHeight: 80,
  },
  timeMinute: {
    fontSize: 72,
    fontWeight: '300',
    color: TEXT_COLOR,
    letterSpacing: -2,
    lineHeight: 80,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 8,
  },
  activeBlinkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
  },
  activeText: {
    color: TEXT_COLOR,
    fontSize: 12,
    fontWeight: '600',
  },
  metricsContainer: { gap: 20, paddingTop: 10 },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metricIcon: { fontSize: 20, width: 24, textAlign: 'center' },
  metricText: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  metricStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  metricStatusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  phoneActions: {
    gap: 12,
  },
  startButton: {
    backgroundColor: '#6bcf7f',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: CARD_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  historyButtonText: {
    color: TEXT_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: TEXT_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
});