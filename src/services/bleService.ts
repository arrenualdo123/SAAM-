import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { BLEDevice, WatchSensorPacket } from '../types';

// UUIDs para el servicio BLE personalizado
const SERVICE_UUID = '0000181a-0000-1000-8000-00805f9b34fb'; // Environmental Sensing Service
const ACCEL_CHARACTERISTIC = '00002a6e-0000-1000-8000-00805f9b34fb';
const GYRO_CHARACTERISTIC = '00002a6f-0000-1000-8000-00805f9b34fb';

export class BLEService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private listeners: Map<string, (data: WatchSensorPacket) => void> = new Map();

  constructor() {
    this.manager = new BleManager();
  }

  /**
   * Solicitar permisos de Bluetooth (Android)
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
          granted['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
        );
      } catch (error) {
        console.error('Error requesting permissions:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * Verificar si Bluetooth está habilitado
   */
  async isBluetoothEnabled(): Promise<boolean> {
    const state = await this.manager.state();
    return state === 'PoweredOn';
  }

  /**
   * Escanear dispositivos cercanos
   */
  async scanForDevices(
    onDeviceFound: (device: BLEDevice) => void,
    duration: number = 10000
  ): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Permisos de Bluetooth no otorgados');
    }

    const isEnabled = await this.isBluetoothEnabled();
    if (!isEnabled) {
      throw new Error('Bluetooth no está habilitado');
    }

    // Detener escaneo previo
    this.manager.stopDeviceScan();

    return new Promise((resolve) => {
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          return;
        }

        if (device && device.name) {
          // Filtrar solo dispositivos relacionados con Parkinson o WearOS
          if (
            device.name.includes('Parkinson') ||
            device.name.includes('Watch') ||
            device.name.includes('Wear')
          ) {
            onDeviceFound({
              id: device.id,
              name: device.name,
              rssi: device.rssi || -100,
              isConnectable: device.isConnectable || false,
            });
          }
        }
      });

      // Detener escaneo después de la duración especificada
      setTimeout(() => {
        this.manager.stopDeviceScan();
        resolve();
      }, duration);
    });
  }

  /**
   * Conectar a un dispositivo específico
   */
  async connectToDevice(deviceId: string): Promise<void> {
    try {
      // Desconectar dispositivo anterior si existe
      if (this.connectedDevice) {
        await this.disconnect();
      }

      // Conectar al nuevo dispositivo
      const device = await this.manager.connectToDevice(deviceId);
      
      // Descubrir servicios y características
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevice = device;

      console.log('✅ Conectado al dispositivo:', device.name);
    } catch (error) {
      console.error('Error al conectar:', error);
      throw error;
    }
  }

  /**
   * Verificar si hay un dispositivo conectado
   */
  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  /**
   * Obtener información del dispositivo conectado
   */
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
   * Suscribirse a datos del acelerómetro
   */
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
        (error, characteristic) => {
          if (error) {
            console.error('Error al leer acelerómetro:', error);
            return;
          }

          if (characteristic?.value) {
            const data = this.parseCharacteristicData(characteristic, 'accelerometer');
            callback(data);
          }
        }
      );

      this.listeners.set('accelerometer', callback);
    } catch (error) {
      console.error('Error al suscribirse al acelerómetro:', error);
      throw error;
    }
  }

  /**
   * Suscribirse a datos del giroscopio
   */
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
        (error, characteristic) => {
          if (error) {
            console.error('Error al leer giroscopio:', error);
            return;
          }

          if (characteristic?.value) {
            const data = this.parseCharacteristicData(characteristic, 'gyroscope');
            callback(data);
          }
        }
      );

      this.listeners.set('gyroscope', callback);
    } catch (error) {
      console.error('Error al suscribirse al giroscopio:', error);
      throw error;
    }
  }

  /**
   * Parsear datos de la característica BLE
   */
  private parseCharacteristicData(
    characteristic: Characteristic,
    type: 'accelerometer' | 'gyroscope'
  ): WatchSensorPacket {
    // Decodificar base64 a bytes
    const value = characteristic.value;
    if (!value) {
      throw new Error('No hay datos en la característica');
    }

    // Convertir base64 a buffer
    const buffer = Buffer.from(value, 'base64');

    // Parsear como Float32Array (4 bytes por valor)
    // Formato: [x, y, z, timestamp]
    const data = new Float32Array(buffer.buffer);

    return {
      type,
      x: data[0] || 0,
      y: data[1] || 0,
      z: data[2] || 0,
      timestamp: data[3] || Date.now(),
    };
  }

  /**
   * Desconectar del dispositivo
   */
  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.manager.cancelDeviceConnection(this.connectedDevice.id);
        this.connectedDevice = null;
        this.listeners.clear();
        console.log('✅ Dispositivo desconectado');
      } catch (error) {
        console.error('Error al desconectar:', error);
        throw error;
      }
    }
  }

  /**
   * Limpiar recursos
   */
  destroy(): void {
    this.disconnect();
    this.manager.destroy();
  }

  /**
   * Obtener nivel de batería del smartwatch
   */
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
      console.error('Error al leer batería:', error);
      return null;
    }
  }
}

// Singleton para uso global
export const bleService = new BLEService();