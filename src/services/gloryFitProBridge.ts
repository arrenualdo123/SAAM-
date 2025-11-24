import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SensorReading } from '../types';

const { GloryFitProBridge } = NativeModules;

export interface GloryFitProData {
  timestamp: number;
  x: number;
  y: number;
  z: number;
  heartRate?: number;
  steps?: number;
}

export interface GloryFitProStats {
  totalRecords: number;
  lastSync: number;
}

export class GloryFitProBridgeService {
  private static STORAGE_KEY = '@gloryfit_sync_data';
  private static LAST_SYNC_KEY = '@gloryfit_last_sync';
  private static isInitialized = false;
  private static syncInterval: any = null;

  /**
   * Inicializar el Bridge
   */
  static async initialize(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('⚠️ GloryFitPro Bridge solo soporta Android');
      return false;
    }

    try {
      // Verificar si GloryFitPro está instalada
      const isInstalled = await this.isGloryFitProInstalled();
      
      if (!isInstalled.installed) {
        console.warn('⚠️ GloryFitPro no está instalada');
        return false;
      }

      if (!isInstalled.hasData) {
        console.warn('⚠️ GloryFitPro no tiene datos aún');
        return false;
      }

      this.isInitialized = true;
      console.log('✅ GloryFitPro Bridge inicializado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando GloryFitPro Bridge:', error);
      return false;
    }
  }

  /**
   * Verificar si GloryFitPro está instalada
   */
  static async isGloryFitProInstalled(): Promise<{
    installed: boolean;
    hasData: boolean;
  }> {
    try {
      if (!GloryFitProBridge) {
        console.warn('⚠️ Módulo nativo no disponible');
        return { installed: false, hasData: false };
      }

      const result = await GloryFitProBridge.isGloryFitProInstalled();
      return result;
    } catch (error) {
      console.error('❌ Error verificando GloryFitPro:', error);
      return { installed: false, hasData: false };
    }
  }

  /**
   * Leer todos los datos de sensores
   */
  static async readSensorData(): Promise<GloryFitProData[]> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('GloryFitPro no está disponible');
        }
      }

      console.log('📖 Leyendo datos de GloryFitPro...');
      const data = await GloryFitProBridge.readSensorData();

      if (!Array.isArray(data)) {
        throw new Error('Datos inválidos recibidos');
      }

      console.log(`✅ ${data.length} registros leídos de GloryFitPro`);
      return data;
    } catch (error) {
      console.error('❌ Error leyendo datos:', error);
      return [];
    }
  }

  /**
   * Obtener últimas N lecturas
   */
  static async getLatestSensorData(limit: number = 100): Promise<GloryFitProData[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`📖 Obteniendo últimos ${limit} registros...`);
      const data = await GloryFitProBridge.getLatestSensorData(limit);

      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo datos recientes:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas
   */
  static async getStatistics(): Promise<GloryFitProStats> {
    try {
      const stats = await GloryFitProBridge.getStatistics();
      return stats;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return { totalRecords: 0, lastSync: 0 };
    }
  }

  /**
   * Convertir datos de GloryFitPro a SensorReading
   */
  static convertToSensorReading(data: GloryFitProData): SensorReading {
    return {
      timestamp: Math.floor(data.timestamp),
      x: data.x || 0,
      y: data.y || 0,
      z: data.z || 0,
      magnitude: Math.sqrt(
        Math.pow(data.x || 0, 2) +
        Math.pow(data.y || 0, 2) +
        Math.pow(data.z || 0, 2)
      ),
    };
  }

  /**
   * Sincronizar datos a AsyncStorage
   */
  static async syncDataToStorage(): Promise<boolean> {
    try {
      const startTime = Date.now();
      console.log('🔄 Iniciando sincronización...');

      const data = await this.readSensorData();

      if (data.length === 0) {
        console.warn('⚠️ No hay datos para sincronizar');
        return false;
      }

      // Convertir a SensorReadings
      const readings = data.map((d) => this.convertToSensorReading(d));

      // Guardar en AsyncStorage
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(readings)
      );

      // Guardar timestamp de última sincronización
      await AsyncStorage.setItem(
        this.LAST_SYNC_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          recordCount: readings.length,
        })
      );

      const elapsed = Date.now() - startTime;
      console.log(
        `✅ Sincronización completada en ${elapsed}ms (${readings.length} registros)`
      );

      return true;
    } catch (error) {
      console.error('❌ Error durante sincronización:', error);
      return false;
    }
  }

  /**
   * Obtener datos sincronizados
   */
  static async getSyncedData(): Promise<SensorReading[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);

      if (!data) {
        console.log('ℹ️ Sin datos sincronizados aún');
        return [];
      }

      const readings = JSON.parse(data) as SensorReading[];
      console.log(`📊 ${readings.length} registros en AsyncStorage`);

      return readings;
    } catch (error) {
      console.error('❌ Error obteniendo datos sincronizados:', error);
      return [];
    }
  }

  /**
   * Obtener información de última sincronización
   */
  static async getLastSyncInfo(): Promise<{
    timestamp: number;
    recordCount: number;
  } | null> {
    try {
      const info = await AsyncStorage.getItem(this.LAST_SYNC_KEY);

      if (!info) {
        return null;
      }

      return JSON.parse(info);
    } catch (error) {
      console.error('❌ Error obteniendo info de sync:', error);
      return null;
    }
  }

  /**
   * Iniciar sincronización automática
   */
  static async startAutoSync(intervalMinutes: number = 5): Promise<void> {
    try {
      // Sincronizar inmediatamente
      await this.syncDataToStorage();

      // Sincronizar cada N minutos
      this.syncInterval = setInterval(async () => {
        console.log('⏰ Ejecutando sincronización automática...');
        await this.syncDataToStorage();
      }, intervalMinutes * 60 * 1000);

      console.log(
        `✅ Auto-sincronización iniciada (cada ${intervalMinutes} minutos)`
      );
    } catch (error) {
      console.error('❌ Error iniciando auto-sync:', error);
    }
  }

  /**
   * Detener sincronización automática
   */
  static stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🛑 Auto-sincronización detenida');
    }
  }

  /**
   * Limpiar datos sincronizados
   */
  static async clearSyncedData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      await AsyncStorage.removeItem(this.LAST_SYNC_KEY);
      console.log('🗑️ Datos sincronizados eliminados');
    } catch (error) {
      console.error('❌ Error limpiando datos:', error);
    }
  }

  /**
   * Destruir y limpiar
   */
  static destroy(): void {
    this.stopAutoSync();
    this.isInitialized = false;
    console.log('🔌 GloryFitPro Bridge destruido');
  }
}