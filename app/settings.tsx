import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BACKGROUND_COLOR, TEXT_COLOR, CARD_COLOR } from '../src/utils/constants';
import { StorageService } from '../src/services/storageService';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [saveSensorData, setSaveSensorData] = useState(true);

  const handleClearData = () => {
    Alert.alert(
      '⚠️ Eliminar Datos',
      '¿Estás seguro de que deseas eliminar todas las sesiones guardadas? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAllSessions();
            Alert.alert('✅ Datos eliminados', 'Todas las sesiones han sido borradas.');
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const json = await StorageService.exportToJSON();
      Alert.alert('📄 Datos Exportados', `${json.length} caracteres exportados`);
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudieron exportar los datos');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={TEXT_COLOR} />
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección: Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notificaciones</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="bell" size={22} color={TEXT_COLOR} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Alertas de Tremor</Text>
                <Text style={styles.settingDescription}>
                  Notificar cuando se detecte tremor alto
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#6BCF7F' }}
              thumbColor={notifications ? TEXT_COLOR : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Sección: Sincronización */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Sincronización</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="sync" size={22} color={TEXT_COLOR} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Sincronización Automática</Text>
                <Text style={styles.settingDescription}>
                  Guardar datos automáticamente cada 5 minutos
                </Text>
              </View>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: '#767577', true: '#6BCF7F' }}
              thumbColor={autoSync ? TEXT_COLOR : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Sección: Datos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Datos</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="database" size={22} color={TEXT_COLOR} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Guardar Datos de Sensores</Text>
                <Text style={styles.settingDescription}>
                  Almacenar lecturas completas de sensores
                </Text>
              </View>
            </View>
            <Switch
              value={saveSensorData}
              onValueChange={setSaveSensorData}
              trackColor={{ false: '#767577', true: '#6BCF7F' }}
              thumbColor={saveSensorData ? TEXT_COLOR : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <MaterialCommunityIcons name="export" size={22} color={TEXT_COLOR} />
            <Text style={styles.actionButtonText}>Exportar Datos (JSON)</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_COLOR} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
            <MaterialCommunityIcons name="delete" size={22} color="#FF6B6B" />
            <Text style={styles.dangerButtonText}>Eliminar Todos los Datos</Text>
            <Ionicons name="chevron-forward" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* Sección: Apariencia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Apariencia</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={22} color={TEXT_COLOR} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Modo Oscuro</Text>
                <Text style={styles.settingDescription}>
                  Próximamente disponible
                </Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              disabled
              trackColor={{ false: '#767577', true: '#6BCF7F' }}
              thumbColor={darkMode ? TEXT_COLOR : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Sección: Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Información</Text>
          
          <TouchableOpacity style={styles.infoItem}>
            <MaterialCommunityIcons name="information" size={22} color={TEXT_COLOR} />
            <Text style={styles.infoText}>Versión 1.0.0 (Beta)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <MaterialCommunityIcons name="license" size={22} color={TEXT_COLOR} />
            <Text style={styles.infoText}>Licencias de Código Abierto</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_COLOR} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <MaterialCommunityIcons name="help-circle" size={22} color={TEXT_COLOR} />
            <Text style={styles.infoText}>Ayuda y Soporte</Text>
            <Ionicons name="chevron-forward" size={20} color={TEXT_COLOR} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(248, 247, 244, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 16,
    opacity: 0.8,
  },
  settingItem: {
    backgroundColor: CARD_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: TEXT_COLOR,
    opacity: 0.6,
    lineHeight: 16,
  },
  actionButton: {
    backgroundColor: CARD_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_COLOR,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  dangerButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  infoItem: {
    backgroundColor: CARD_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_COLOR,
  },
});