import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BACKGROUND_COLOR, TEXT_COLOR, CARD_COLOR } from '../src/utils/constants';
import { StorageService } from '../src/services/storageService';
import { PDFService } from '../src/services/pdfService';
import { TremorSession, SessionStatistics } from '../src/types';

const { width } = Dimensions.get('window');
const isWearOS = width < 300;

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TremorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<SessionStatistics | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await StorageService.getAllSessions();
      setSessions(data.sort((a, b) => b.startTime - a.startTime));
      
      if (data.length > 0) {
        const statistics = PDFService.calculateStatistics(data);
        setStats(statistics);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las sesiones');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (sessions.length === 0) {
      Alert.alert('Sin datos', 'No hay sesiones para exportar');
      return;
    }

    Alert.alert(
      'Exportar Reporte',
      '¿Qué información deseas incluir?',
      [
        {
          text: 'Reporte Completo',
          onPress: () => exportPDF(true, true, true),
        },
        {
          text: 'Solo Estadísticas',
          onPress: () => exportPDF(true, false, false),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const exportPDF = async (
    includeStats: boolean,
    includeCharts: boolean,
    includeRawData: boolean
  ) => {
    try {
      setExporting(true);
      
      const sessionsToExport = selectedSessions.length > 0
        ? sessions.filter(s => selectedSessions.includes(s.id))
        : sessions;

      const fileUri = await PDFService.exportToPDF({
        sessions: sessionsToExport,
        includeStatistics: includeStats,
        includeCharts,
        includeRawData,
        patientName: 'Usuario', // Puedes agregar un input para esto
      });

      await PDFService.sharePDF(fileUri);
      
      Alert.alert('Éxito', 'Reporte generado y compartido correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el reporte');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    Alert.alert(
      'Eliminar Sesión',
      '¿Estás seguro de eliminar esta sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await StorageService.deleteSession(id);
            loadSessions();
          },
        },
      ]
    );
  };

  const toggleSessionSelection = (id: string) => {
    setSelectedSessions(prev =>
      prev.includes(id)
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const getTremorColor = (index: number) => {
    if (index > 66) return '#ff6b6b';
    if (index > 33) return '#ffd93d';
    return '#6bcf7f';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={TEXT_COLOR} />
      </SafeAreaView>
    );
  }

  if (isWearOS) {
    return (
      <SafeAreaView style={styles.wearContainer}>
        <Text style={styles.wearTitle}>Historial</Text>
        
        {sessions.length === 0 ? (
          <Text style={styles.wearEmptyText}>Sin sesiones</Text>
        ) : (
          <ScrollView style={styles.wearScroll} showsVerticalScrollIndicator={false}>
            {sessions.slice(0, 5).map((session, idx) => (
              <View key={session.id} style={styles.wearSessionCard}>
                <Text style={styles.wearSessionTime}>
                  {new Date(session.startTime).toLocaleDateString('es-MX')}
                </Text>
                <Text style={styles.wearSessionTremor}>
                  {session.tremorIndex}%
                </Text>
                <View
                  style={[
                    styles.wearSessionBadge,
                    { backgroundColor: getTremorColor(session.tremorIndex) },
                  ]}
                />
              </View>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity
          style={styles.wearExportButton}
          onPress={handleExportPDF}
          disabled={exporting || sessions.length === 0}
        >
          <Text style={styles.wearExportButtonText}>
            {exporting ? '...' : '📄'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.wearBackButton} onPress={() => router.back()}>
          <Text style={styles.wearBackButtonText}>←</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.phoneContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historial de Sesiones</Text>
      </View>

      {stats && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Estadísticas Generales</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalSessions}</Text>
              <Text style={styles.statLabel}>Sesiones</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.averageTremorIndex}%</Text>
              <Text style={styles.statLabel}>Promedio</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {Math.floor(stats.totalDuration / 60)}m
              </Text>
              <Text style={styles.statLabel}>Duración</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false}>
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No hay sesiones registradas</Text>
            <Text style={styles.emptySubtext}>
              Comienza una sesión desde el Dashboard
            </Text>
          </View>
        ) : (
          sessions.map((session, idx) => (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionCard,
                selectedSessions.includes(session.id) && styles.sessionCardSelected,
              ]}
              onPress={() => toggleSessionSelection(session.id)}
              onLongPress={() => handleDeleteSession(session.id)}
            >
              <View style={styles.sessionHeader}>
                <View>
                  <Text style={styles.sessionTitle}>Sesión {sessions.length - idx}</Text>
                  <Text style={styles.sessionDate}>
                    {new Date(session.startTime).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.sessionTime}>
                    {new Date(session.startTime).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.sessionMetrics}>
                  <Text
                    style={[
                      styles.tremorIndex,
                      { color: getTremorColor(session.tremorIndex) },
                    ]}
                  >
                    {session.tremorIndex}%
                  </Text>
                  <Text
                    style={[
                      styles.tremorStatus,
                      { backgroundColor: getTremorColor(session.tremorIndex) },
                    ]}
                  >
                    {session.tremorStatus}
                  </Text>
                </View>
              </View>
              
              <View style={styles.sessionFooter}>
                <Text style={styles.sessionDuration}>
                  ⏱️ {formatDuration(session.duration)}
                </Text>
                {session.heartRate && (
                  <Text style={styles.sessionHeartRate}>
                    ❤️ {session.heartRate} BPM
                  </Text>
                )}
                <Text style={styles.sessionReadings}>
                  📊 {session.readings.length} lecturas
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        {selectedSessions.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSelectedSessions([])}
          >
            <Text style={styles.clearButtonText}>
              Deseleccionar ({selectedSessions.length})
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
          onPress={handleExportPDF}
          disabled={exporting || sessions.length === 0}
        >
          <Text style={styles.exportButtonText}>
            {exporting ? 'Generando...' : '📄 Exportar PDF'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // WearOS Styles
  wearContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    padding: 15,
    justifyContent: 'space-between',
  },
  wearTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    textAlign: 'center',
    marginBottom: 10,
  },
  wearEmptyText: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.7,
    textAlign: 'center',
  },
  wearScroll: {
    flex: 1,
  },
  wearSessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wearSessionTime: {
    fontSize: 10,
    color: TEXT_COLOR,
    opacity: 0.7,
  },
  wearSessionTremor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  wearSessionBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  wearExportButton: {
    backgroundColor: TEXT_COLOR,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  wearExportButtonText: {
    fontSize: 20,
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

  // Phone Styles
  phoneContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
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
  statsCard: {
    backgroundColor: CARD_COLOR,
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.7,
    marginTop: 5,
  },
  sessionsList: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: TEXT_COLOR,
    opacity: 0.7,
  },
  sessionCard: {
    backgroundColor: CARD_COLOR,
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },
  sessionCardSelected: {
    borderWidth: 3,
    borderColor: TEXT_COLOR,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 5,
  },
  sessionDate: {
    fontSize: 14,
    color: TEXT_COLOR,
    opacity: 0.8,
  },
  sessionTime: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.6,
    marginTop: 2,
  },
  sessionMetrics: {
    alignItems: 'flex-end',
  },
  tremorIndex: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tremorStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(248, 247, 244, 0.2)',
  },
  sessionDuration: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.8,
  },
  sessionHeartRate: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.8,
  },
  sessionReadings: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.8,
  },
  bottomActions: {
    padding: 20,
    gap: 10,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: TEXT_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: TEXT_COLOR,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButtonDisabled: {
    opacity: 0.5,
  },
  exportButtonText: {
    color: BACKGROUND_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
});