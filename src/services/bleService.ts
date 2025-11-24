// src/services/bleService.ts - VERSIÓN BLACKVIEW W60

import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { BLEDevice, WatchSensorPacket } from '../types';
import { BLACKVIEW_W60_CONFIG, BlackviewW60Config } from './bleConfigBlackviewW60';

export class BLEService {
  private manager: BleManager | null = null;
  private connectedDevice: Device | null = null;
  private listeners: Map<string, (data: WatchSensorPacket) => void> = new Map();

  constructor() {
    try {
      this.manager = new BleManager();
      console.log('✅ BLE Manager inicializado para Blackview W60');
    } catch (error) {
      console.warn('⚠️ BLE Manager no disponible:', error);
      this.manager = null;
    }
  }

  private ensureManager(): BleManager {
    if (!this.manager) {
      throw new Error('BLE no está disponible en este dispositivo');
    }
    return this.manager;
  }

  /**
   * Solicitar permisos para Android 12+
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      if (Platform.Version >= 31) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        console.log('🔐 Solicitando permisos para Android 12+...');
        
        const granted = await PermissionsAndroid.requestMultiple(permissions);

        const allGranted = 
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

        if (!allGranted) {
          Alert.alert(
            'Permisos necesarios',
            'La app necesita permisos de Bluetooth y Ubicación. Actívalos en Configuración.',
            [{ text: 'OK' }]
          );
          return false;
        }

        console.log('✅ Permisos otorgados');
        return true;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('❌ Error al solicitar permisos:', error);
      return false;
    }
  }

  /**
   * Verificar si Bluetooth está habilitado
   */
  async isBluetoothEnabled(): Promise<boolean> {
    try {
      const manager = this.ensureManager();
      const state = await manager.state();
      
      console.log('📡 Estado Bluetooth:', state);

      if (state !== State.PoweredOn) {
        Alert.alert(
          'Bluetooth desactivado',
          'Por favor, activa el Bluetooth para continuar.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error al verificar Bluetooth:', error);
      return false;
    }
  }

  /**
   * Escanear dispositivos (especialmente Blackview W60)
   */
  async scanForDevices(
    onDeviceFound: (device: BLEDevice) => void,
    duration: number = 10000
  ): Promise<void> {
    const manager = this.ensureManager();

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permisos de Bluetooth no otorgados');
      }

      const isEnabled = await this.isBluetoothEnabled();
      if (!isEnabled) {
        throw new Error('Bluetooth no está habilitado');
      }

      manager.stopDeviceScan();

      console.log('🔍 Iniciando escaneo de dispositivos...');

      return new Promise((resolve, reject) => {
        const foundDevices = new Set<string>();

        manager.startDeviceScan(
          null, 
          { allowDuplicates: false },
          (error: any, device: any) => {
            if (error) {
              console.error('❌ Error en escaneo:', error);
              manager.stopDeviceScan();
              reject(error);
              return;
            }

            if (device && device.name && !foundDevices.has(device.id)) {
              foundDevices.add(device.id);

              const name = device.name.toLowerCase();
              
              // Buscar específicamente Blackview W60
              if (
                name.includes('blackview') ||
                name.includes('w60') ||
                name.includes('glory') ||
                device.localName?.includes('Blackview')
              ) {
                console.log(`✅ ¡Encontrado! ${device.name} (${device.id})`);
                console.log(`   RSSI: ${device.rssi}, Connectable: ${device.isConnectable}`);
                
                onDeviceFound({
                  id: device.id,
                  name: device.name,
                  rssi: device.rssi || -100,
                  isConnectable: device.isConnectable !== false,
                });
              } else if (name.includes('watch') || name.includes('smart')) {
                // Mostrar otros smartwatches como opción
                console.log(`📱 Dispositivo encontrado: ${device.name}`);
                onDeviceFound({
                  id: device.id,
                  name: device.name,
                  rssi: device.rssi || -100,
                  isConnectable: device.isConnectable !== false,
                });
              }
            }
          }
        );

        setTimeout(() => {
          manager.stopDeviceScan();
          console.log('⏱️ Escaneo finalizado');
          resolve();
        }, duration);
      });
    } catch (error) {
      manager.stopDeviceScan();
      console.error('❌ Error en scanForDevices:', error);
      throw error;
    }
  }

  /**
   * Conectar al Blackview W60
   */
  async connectToDevice(deviceId: string): Promise<void> {
    const manager = this.ensureManager();
    
    try {
      if (this.connectedDevice) {
        await this.disconnect();
      }

      console.log('🔗 Conectando a dispositivo:', deviceId);
      
      const device = await manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevice = device;
      console.log('✅ Conectado a:', device.name);

      // Intentar habilitar notificaciones automáticamente
      await this.setupNotifications();
    } catch (error) {
      console.error('❌ Error al conectar:', error);
      throw error;
    }
  }

  /**
   * Configurar notificaciones automáticas
   */
  private async setupNotifications(): Promise<void> {
    if (!this.connectedDevice) return;

    try {
      // Intentar habilitar Battery Level
      try {
        await this.connectedDevice.monitorCharacteristicForService(
          BLACKVIEW_W60_CONFIG.BATTERY_SERVICE,
          BLACKVIEW_W60_CONFIG.BATTERY_LEVEL,
          (error, char) => {
            if (!error && char?.value) {
              const battery = BLACKVIEW_W60_CONFIG.BATTERY_PARSER(
                Buffer.from(char.value, 'base64').buffer
              );
              console.log(`📊 Nivel de batería: ${battery.level}%`);
            }
          }
        );
        console.log('✅ Battery Level notifications habilitadas');
      } catch (e) {
        console.warn('⚠️ No se pudo habilitar Battery Level');
      }

      // Intentar habilitar Heart Rate
      try {
        await this.connectedDevice.monitorCharacteristicForService(
          BLACKVIEW_W60_CONFIG.HEART_RATE_SERVICE,
          BLACKVIEW_W60_CONFIG.HEART_RATE_MEASUREMENT,
          (error, char) => {
            if (!error && char?.value) {
              const hr = BLACKVIEW_W60_CONFIG.HEART_RATE_PARSER(
                Buffer.from(char.value, 'base64').buffer
              );
              console.log(`❤️ Frecuencia cardíaca: ${hr.heartRate} bpm`);
            }
          }
        );
        console.log('✅ Heart Rate notifications habilitadas');
      } catch (e) {
        console.warn('⚠️ No se pudo habilitar Heart Rate');
      }
    } catch (error) {
      console.warn('⚠️ Error en setupNotifications:', error);
    }
  }

  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  getConnectedDevice(): BLEDevice | null {
    if (!this.connectedDevice) return null;

    return {
      id: this.connectedDevice.id,
      name: this.connectedDevice.name,
      rssi: this.connectedDevice.rssi || -100,
      isConnectable: true,
    };
  }

  /**
   * Suscribirse al acelerómetro
   */
  async subscribeToAccelerometer(
    callback: (data: WatchSensorPacket) => void
  ): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No hay dispositivo conectado');
    }

    try {
      // Intentar con servicio propietario primero
      await this.connectedDevice.monitorCharacteristicForService(
        BLACKVIEW_W60_CONFIG.MOTION_SERVICE,
        BLACKVIEW_W60_CONFIG.ACCELEROMETER_CHARACTERISTIC,
        (error: any, characteristic: any) => {
          if (error) {
            console.warn('❌ Error al leer acelerómetro:', error);
            return;
          }

          if (characteristic?.value) {
            const buffer = Buffer.from(characteristic.value, 'base64').buffer;
            const accelData = BLACKVIEW_W60_CONFIG.ACCELEROMETER_PARSER(buffer);
            
            const packet: WatchSensorPacket = {
              type: 'accelerometer',
              x: accelData.x,
              y: accelData.y,
              z: accelData.z,
              timestamp: Date.now(),
            };
            
            callback(packet);
          }
        }
      );

      this.listeners.set('accelerometer', callback);
      console.log('✅ Suscrito al acelerómetro');
    } catch (error) {
      console.error('❌ Error al suscribirse al acelerómetro:', error);
      throw error;
    }
  }

  /**
   * Suscribirse al giroscopio
   */
  async subscribeToGyroscope(
    callback: (data: WatchSensorPacket) => void
  ): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No hay dispositivo conectado');
    }

    try {
      await this.connectedDevice.monitorCharacteristicForService(
        BLACKVIEW_W60_CONFIG.MOTION_SERVICE,
        BLACKVIEW_W60_CONFIG.GYROSCOPE_CHARACTERISTIC,
        (error: any, characteristic: any) => {
          if (error) {
            console.warn('❌ Error al leer giroscopio:', error);
            return;
          }

          if (characteristic?.value) {
            const buffer = Buffer.from(characteristic.value, 'base64').buffer;
            const gyroData = BLACKVIEW_W60_CONFIG.GYROSCOPE_PARSER(buffer);
            
            const packet: WatchSensorPacket = {
              type: 'gyroscope',
              x: gyroData.x,
              y: gyroData.y,
              z: gyroData.z,
              timestamp: Date.now(),
            };
            
            callback(packet);
          }
        }
      );

      this.listeners.set('gyroscope', callback);
      console.log('✅ Suscrito al giroscopio');
    } catch (error) {
      console.error('❌ Error al suscribirse al giroscopio:', error);
      throw error;
    }
  }

  /**
   * Obtener nivel de batería
   */
  async getBatteryLevel(): Promise<number | null> {
    if (!this.connectedDevice) return null;

    try {
      const characteristic = await this.connectedDevice.readCharacteristicForService(
        BLACKVIEW_W60_CONFIG.BATTERY_SERVICE,
        BLACKVIEW_W60_CONFIG.BATTERY_LEVEL
      );

      if (characteristic.value) {
        const buffer = Buffer.from(characteristic.value, 'base64').buffer;
        const battery = BLACKVIEW_W60_CONFIG.BATTERY_PARSER(buffer);
        return battery.level;
      }

      return null;
    } catch (error) {
      console.error('❌ Error al leer batería:', error);
      return null;
    }
  }

  /**
   * Desconectar
   */
  async disconnect(): Promise<void> {
    const manager = this.ensureManager();
    
    if (this.connectedDevice) {
      try {
        await manager.cancelDeviceConnection(this.connectedDevice.id);
        this.connectedDevice = null;
        this.listeners.clear();
        console.log('✅ Dispositivo desconectado');
      } catch (error) {
        console.error('❌ Error al desconectar:', error);
        throw error;
      }
    }
  }

  destroy(): void {
    this.disconnect();
    if (this.manager) {
      this.manager.destroy();
    }
  }
}

export const bleService = new BLEService();