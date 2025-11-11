import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BACKGROUND_COLOR, TEXT_COLOR, CARD_COLOR } from '../src/utils/constants';

const { width } = Dimensions.get('window');
const isWearOS = width < 300;

export default function DashboardScreen() {
  const router = useRouter();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (isWearOS) {
    return (
      <SafeAreaView style={styles.wearContainer}>
        <Text style={styles.wearTitle}>Menú</Text>
        <ScrollView style={styles.wearScroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.wearMenuItem}
            onPress={() => router.push('/connect')}
          >
            <MaterialCommunityIcons name="bluetooth" size={20} color={TEXT_COLOR} />
            <Text style={styles.wearMenuText}>Conectar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.wearMenuItem}
            onPress={() => router.push('/sensors')}
          >
            <MaterialCommunityIcons name="chart-line" size={20} color={TEXT_COLOR} />
            <Text style={styles.wearMenuText}>Sensores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.wearMenuItem}
            onPress={() => router.push('/history')}
          >
            <Ionicons name="document-text" size={20} color={TEXT_COLOR} />
            <Text style={styles.wearMenuText}>Historial</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={styles.wearBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={BACKGROUND_COLOR} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND_COLOR} />
      
      {/* Header con reloj */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola 👋</Text>
          <Text style={styles.subtitle}>Monitoreo de Parkinson</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(time)}</Text>
          <Text style={styles.dateText}>
            {time.toLocaleDateString('es-MX', { 
              day: 'numeric',
              month: 'short' 
            })}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Estadísticas rápidas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#6BCF7F' }]}>
              <MaterialCommunityIcons name="run" size={24} color="white" />
            </View>
            <Text style={styles.statValue}>23.5</Text>
            <Text style={styles.statLabel}>mph</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFD93D' }]}>
              <MaterialCommunityIcons name="rotate-3d-variant" size={24} color="white" />
            </View>
            <Text style={styles.statValue}>23.5</Text>
            <Text style={styles.statLabel}>°/s</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FF6B6B' }]}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color="white" />
            </View>
            <Text style={styles.statValue}>85</Text>
            <Text style={styles.statLabel}>BPM</Text>
          </View>
        </View>

        {/* Acción principal */}
        <TouchableOpacity
          style={styles.primaryCard}
          onPress={() => router.push('/connect')}
          activeOpacity={0.8}
        >
          <View style={styles.primaryCardContent}>
            <View style={styles.primaryCardLeft}>
              <View style={styles.primaryIconCircle}>
                <MaterialCommunityIcons name="bluetooth-connect" size={32} color="white" />
              </View>
              <View>
                <Text style={styles.primaryCardTitle}>Conectar Smartwatch</Text>
                <Text style={styles.primaryCardSubtitle}>
                  Vincular dispositivo vía Bluetooth
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={TEXT_COLOR} />
          </View>
        </TouchableOpacity>

        {/* Grid de opciones */}
        <View style={styles.menuGrid}>
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/realtime')}
            activeOpacity={0.8}
          >
            <View style={styles.menuCardHeader}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <MaterialCommunityIcons name="pulse" size={28} color="#2196F3" />
              </View>
            </View>
            <Text style={styles.menuCardTitle}>Tiempo Real</Text>
            <Text style={styles.menuCardDescription}>
              Monitoreo en vivo de sensores
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/sensors')}
            activeOpacity={0.8}
          >
            <View style={styles.menuCardHeader}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#F3E5F5' }]}>
                <MaterialCommunityIcons name="chart-line" size={28} color="#9C27B0" />
              </View>
            </View>
            <Text style={styles.menuCardTitle}>Sensores</Text>
            <Text style={styles.menuCardDescription}>
              Acelerómetro y giroscopio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/history')}
            activeOpacity={0.8}
          >
            <View style={styles.menuCardHeader}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="document-text" size={28} color="#FF9800" />
              </View>
            </View>
            <Text style={styles.menuCardTitle}>Historial</Text>
            <Text style={styles.menuCardDescription}>
              Sesiones guardadas y PDFs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/connect')}
            activeOpacity={0.8}
          >
            <View style={styles.menuCardHeader}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="cog" size={28} color="#4CAF50" />
              </View>
            </View>
            <Text style={styles.menuCardTitle}>Configuración</Text>
            <Text style={styles.menuCardDescription}>
              Ajustes de la aplicación
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <MaterialCommunityIcons name="information" size={20} color="#2196F3" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>¿Necesitas ayuda?</Text>
            <Text style={styles.infoText}>
              Consulta la guía de uso o contacta con soporte
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón flotante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/realtime')}
        activeOpacity={0.9}
      >
        <MaterialCommunityIcons name="play" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_COLOR,
    opacity: 0.7,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 24,
    fontWeight: '600',
    color: TEXT_COLOR,
  },
  dateText: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.7,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_COLOR,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.6,
  },
  primaryCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  primaryIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6BCF7F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 4,
  },
  primaryCardSubtitle: {
    fontSize: 13,
    color: TEXT_COLOR,
    opacity: 0.7,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  menuCard: {
    width: (width - 60) / 2,
    backgroundColor: CARD_COLOR,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuCardHeader: {
    marginBottom: 12,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 4,
  },
  menuCardDescription: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.6,
    lineHeight: 16,
  },
  infoCard: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.7,
    lineHeight: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6BCF7F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  // WearOS
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
  wearScroll: {
    flex: 1,
  },
  wearMenuItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wearMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_COLOR,
  },
  wearBackButton: {
    backgroundColor: TEXT_COLOR,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
});