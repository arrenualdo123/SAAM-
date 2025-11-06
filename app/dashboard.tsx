import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BACKGROUND_COLOR, TEXT_COLOR, CARD_COLOR } from '../src/utils/constants';

const { width } = Dimensions.get('window');
const isWearOS = width < 300;

interface TremorData {
  timestamp: number;
  value: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [time, setTime] = useState('12:50');
  const [activeTab, setActiveTab] = useState(0);
  const [tremorIndex, setTremorIndex] = useState(45);
  const [sessionData, setSessionData] = useState<TremorData[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);

      setSessionData((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          value: Math.random() * 100,
        },
      ].slice(-10));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [hour, minute] = time.split(':');

  useEffect(() => {
    if (sessionData.length === 0) {
      setTremorIndex(45);
      return;
    }
    const avg = sessionData.reduce((sum, d) => sum + d.value, 0) / sessionData.length;
    setTremorIndex(Math.round(avg));
  }, [sessionData]);

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

  const getSessionHistory = () => {
    const now = new Date();
    return [
      {
        time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
        tremor: tremorIndex,
        status: 'En curso',
      },
      {
        time: `${String(now.getHours() - 1).padStart(2, '0')}:30`,
        tremor: 42,
        status: 'Completada',
      },
      { time: 'Ayer 15:20', tremor: 38, status: 'Completada' },
    ];
  };

  const getDotStyle = (index: number) => {
    const baseStyle = styles.wearDot;
    if (activeTab === index) {
      return [baseStyle, styles.wearDotActive];
    }
    return [baseStyle, styles.wearDotInactive];
  };

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
            <View style={styles.wearTabIndicators}>
              <TouchableOpacity
                style={getDotStyle(0)}
                onPress={() => setActiveTab(0)}
              />
              <TouchableOpacity
                style={getDotStyle(1)}
                onPress={() => setActiveTab(1)}
              />
              <TouchableOpacity
                style={getDotStyle(2)}
                onPress={() => setActiveTab(2)}
              />
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
            <Text style={styles.wearSmallText}>Sesión: {sessionData.length} datos</Text>
            <View style={styles.wearTabIndicators}>
              <TouchableOpacity
                style={getDotStyle(0)}
                onPress={() => setActiveTab(0)}
              />
              <TouchableOpacity
                style={getDotStyle(1)}
                onPress={() => setActiveTab(1)}
              />
              <TouchableOpacity
                style={getDotStyle(2)}
                onPress={() => setActiveTab(2)}
              />
            </View>
            <TouchableOpacity style={styles.wearBackButton} onPress={() => router.back()}>
              <Text style={styles.wearBackButtonText}>←</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 2 && (
          <View style={styles.wearMetricsView}>
            <Text style={styles.wearTabTitle}>Historial</Text>
            <ScrollView style={styles.wearHistoryScroll} showsVerticalScrollIndicator={false}>
              {getSessionHistory().map((session, idx) => (
                <View key={idx} style={styles.wearHistoryItem}>
                  <Text style={styles.wearHistoryTime}>{session.time}</Text>
                  <Text style={styles.wearHistoryTremor}>{session.tremor}%</Text>
                  <Text style={styles.wearHistoryStatus}>{session.status}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.wearTabIndicators}>
              <TouchableOpacity
                style={getDotStyle(0)}
                onPress={() => setActiveTab(0)}
              />
              <TouchableOpacity
                style={getDotStyle(1)}
                onPress={() => setActiveTab(1)}
              />
              <TouchableOpacity
                style={getDotStyle(2)}
                onPress={() => setActiveTab(2)}
              />
            </View>
            <TouchableOpacity style={styles.wearBackButton} onPress={() => router.back()}>
              <Text style={styles.wearBackButtonText}>←</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

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
          </View>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <Text style={styles.metricIcon}>💓</Text>
            <Text style={styles.metricText}>23.5 mph</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricIcon}>⚡</Text>
            <Text style={styles.metricText}>23.5 °/s</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricIcon}>❤️</Text>
            <Text style={styles.metricText}>85 BPM</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricIcon}>📊</Text>
            <Text style={styles.metricText}>Tremor: {tremorIndex}%</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wearContainer: { flex: 1, backgroundColor: BACKGROUND_COLOR },
  wearMetricsView: { flex: 1, justifyContent: 'space-around', alignItems: 'center', padding: 12 },
  wearTime: { fontSize: 40, fontWeight: '300', color: TEXT_COLOR, letterSpacing: -1 },
  wearTabTitle: { fontSize: 16, fontWeight: 'bold', color: TEXT_COLOR, marginBottom: 10 },
  wearTremorBox: { alignItems: 'center', marginVertical: 10 },
  wearTremorLabel: { fontSize: 12, color: TEXT_COLOR, opacity: 0.7 },
  wearTremorValue: { fontSize: 32, fontWeight: 'bold', color: TEXT_COLOR, marginVertical: 5 },
  wearProgressBar: { width: 80, height: 6, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 3, overflow: 'hidden' },
  wearProgressFill: { height: '100%', borderRadius: 3 },
  wearIndexCard: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 15, borderRadius: 12, marginVertical: 10 },
  wearIndexValue: { fontSize: 36, fontWeight: 'bold', color: TEXT_COLOR },
  wearIndexStatus: { fontSize: 14, fontWeight: '600', marginTop: 5 },
  wearSmallText: { fontSize: 11, color: TEXT_COLOR, opacity: 0.6, marginTop: 4 },
  wearHistoryScroll: { width: '100%', maxHeight: 80 },
  wearHistoryItem: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  wearHistoryTime: { fontSize: 10, color: TEXT_COLOR, opacity: 0.7 },
  wearHistoryTremor: { fontSize: 12, fontWeight: 'bold', color: TEXT_COLOR, marginVertical: 2 },
  wearHistoryStatus: { fontSize: 9, color: TEXT_COLOR, opacity: 0.6 },
  wearTabIndicators: { flexDirection: 'row', gap: 6, marginVertical: 10 },
  wearDot: { width: 6, height: 6, borderRadius: 3 },
  wearDotActive: { backgroundColor: TEXT_COLOR },
  wearDotInactive: { backgroundColor: 'rgba(248, 247, 244, 0.3)' },
  wearBackButton: { backgroundColor: TEXT_COLOR, width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  wearBackButtonText: { color: BACKGROUND_COLOR, fontSize: 16, fontWeight: 'bold' },
  phoneContainer: { flex: 1, backgroundColor: BACKGROUND_COLOR, padding: 20, justifyContent: 'space-between' },
  mainContent: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 30, paddingTop: 60 },
  timeCardWrapper: { justifyContent: 'center' },
  timeCard: { backgroundColor: CARD_COLOR, borderRadius: 24, padding: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8, minWidth: 200 },
  timeDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  timeHour: { fontSize: 72, fontWeight: '300', color: TEXT_COLOR, letterSpacing: -2, lineHeight: 80 },
  timeDot: { fontSize: 60, color: TEXT_COLOR, fontWeight: '300', paddingHorizontal: 5, lineHeight: 80 },
  timeMinute: { fontSize: 72, fontWeight: '300', color: TEXT_COLOR, letterSpacing: -2, lineHeight: 80 },
  metricsContainer: { gap: 24, paddingTop: 10 },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metricIcon: { fontSize: 20, width: 24, textAlign: 'center' },
  metricText: { color: TEXT_COLOR, fontSize: 16, fontWeight: '500', letterSpacing: 0.3 },
  backButton: { backgroundColor: TEXT_COLOR, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', marginBottom: 20 },
  backButtonText: { color: BACKGROUND_COLOR, fontSize: 16, fontWeight: 'bold' },
});