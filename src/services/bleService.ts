// src/services/bleService.ts - VERSIÓN CON MANEJO DE ERRORES

import { BleManager, Device, Characteristic, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { BLEDevice, WatchSensorPacket } from '../types';

const SERVICE_UUID = '0000181a-0000-1000-8000-00805f9b34fb';
const ACCEL_CHARACTERISTIC = '00002a6e-0000-1000-8000-00805f9b34fb';
const GYRO_CHARACTERISTIC = '00002a6f-0000-1000-8000-00805f9b34fb';

export class BLEService {
  private manager: BleManager | null = null;
  private connectedDevice: Device | null = null;
  private listeners: Map<string, (data: WatchSensorPacket) => void> = new Map();

  constructor() {
    try {
      this.manager = new BleManager();
      console.log('✅ BLE Manager inicializado');
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
   * Solicitar TODOS los permisos necesarios (Android 12+)
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS maneja permisos automáticamente
    }

    try {
      if (Platform.Version >= 31) {
        // Android 12+ (API 31+)
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        console.log('📍 Solicitando permisos para Android 12+...');
        
        const granted = await PermissionsAndroid.requestMultiple(permissions);

        const allGranted = 
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

        if (!allGranted) {
          Alert.alert(
            'Permisos necesarios',
            'La app necesita permisos de Bluetooth y Ubicación para escanear dispositivos. Por favor, actívalos en Configuración.',
            [{ text: 'OK' }]
          );
          return false;
        }

        console.log('✅ Permisos otorgados');
        return true;
      } else {
        // Android 11 o menor
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
   * Escanear dispositivos cercanos con manejo de errores
   */
  async scanForDevices(
    onDeviceFound: (device: BLEDevice) => void,
    duration: number = 10000
  ): Promise<void> {
    const manager = this.ensureManager();

    try {
      // 1. Verificar permisos
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permisos de Bluetooth no otorgados');
      }

      // 2. Verificar que Bluetooth esté encendido
      const isEnabled = await this.isBluetoothEnabled();
      if (!isEnabled) {
        throw new Error('Bluetooth no está habilitado');
      }

      // 3. Detener escaneo previo
      manager.stopDeviceScan();

      console.log('🔍 Iniciando escaneo...');

      // 4. Iniciar escaneo
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

              // Filtrar dispositivos relevantes
              const name = device.name.toLowerCase();
              if (
                name.includes('parkinson') ||
                name.includes('watch') ||
                name.includes('wear') ||
                name.includes('galaxy') ||
                name.includes('pixel')
              ) {
                console.log('📱 Dispositivo encontrado:', device.name);
                
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

        // Detener escaneo después de la duración especificada
        setTimeout(() => {
          manager.stopDeviceScan();
          console.log('⏹️ Escaneo detenido');
          resolve();
        }, duration);
      });
    } catch (error) {
      manager.stopDeviceScan();
      console.error('❌ Error en scanForDevices:', error);
      throw error;
    }
  }

  async connectToDevice(deviceId: string): Promise<void> {
    const manager = this.ensureManager();
    
    try {
      if (this.connectedDevice) {
        await this.disconnect();
      }

      console.log('🔗 Conectando a:', deviceId);
      
      const device = await manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevice = device;
      console.log('✅ Conectado a:', device.name);
    } catch (error) {
      console.error('❌ Error al conectar:', error);
      throw error;
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

  async subscribeToAccelerometer(
    callback: (data: WatchSensorPacket) => void
  ): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No hay dispositivo conectado');
    }

    try {
      this.connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        ACCEL_CHARACTERISTIC,
        (error: any, characteristic: any) => {
          if (error) {
            console.error('❌ Error al leer acelerómetro:', error);
            return;
          }

          if (characteristic?.value) {
            const data = this.parseCharacteristicData(characteristic, 'accelerometer');
            callback(data);
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

  async subscribeToGyroscope(
    callback: (data: WatchSensorPacket) => void
  ): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No hay dispositivo conectado');
    }

    try {
      this.connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        GYRO_CHARACTERISTIC,
        (error: any, characteristic: any) => {
          if (error) {
            console.error('❌ Error al leer giroscopio:', error);
            return;
          }

          if (characteristic?.value) {
            const data = this.parseCharacteristicData(characteristic, 'gyroscope');
            callback(data);
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

  private parseCharacteristicData(
    characteristic: Characteristic,
    type: 'accelerometer' | 'gyroscope'
  ): WatchSensorPacket {
    const value = characteristic.value;
    if (!value) {
      throw new Error('No hay datos en la característica');
    }

    const buffer = Buffer.from(value, 'base64');
    const data = new Float32Array(buffer.buffer);

    return {
      type,
      x: data[0] || 0,
      y: data[1] || 0,
      z: data[2] || 0,
      timestamp: data[3] || Date.now(),
    };
  }

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

  async getBatteryLevel(): Promise<number | null> {
    if (!this.connectedDevice) return null;

    try {
      const BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb';
      const BATTERY_LEVEL = '00002a19-0000-1000-8000-00805f9b34fb';

      const characteristic = await this.connectedDevice.readCharacteristicForService(
        BATTERY_SERVICE,
        BATTERY_LEVEL
      );

      if (characteristic.value) {
        const buffer = Buffer.from(characteristic.value, 'base64');
        return buffer[0];
      }

      return null;
    } catch (error) {
      console.error('⚠️ No se pudo leer batería:', error);
      return null;
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