import { useState, useEffect, useCallback } from 'react';
import { bleService } from '../services/bleService';
import { BLEDevice, WatchSensorPacket, SensorDataStream } from '../types';

export function useBLEConnection() {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<BLEDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BLEDevice | null>(null);
  const [sensorData, setSensorData] = useState<SensorDataStream>({
    accelerometer: null,
    gyroscope: null,
  });
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Escanear dispositivos
   */
  const scanDevices = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);
      setAvailableDevices([]);

      await bleService.scanForDevices((device) => {
        setAvailableDevices((prev) => {
          // Evitar duplicados
          const exists = prev.find((d) => d.id === device.id);
          if (exists) return prev;
          return [...prev, device];
        });
      }, 10000); // Escanear por 10 segundos

      setIsScanning(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al escanear');
      setIsScanning(false);
    }
  }, []);

  /**
   * Conectar a un dispositivo
   */
  const connectToDevice = useCallback(async (deviceId: string) => {
    try {
      setError(null);
      await bleService.connectToDevice(deviceId);

      const device = bleService.getConnectedDevice();
      setConnectedDevice(device);
      setIsConnected(true);

      // Suscribirse a sensores
      await bleService.subscribeToAccelerometer((data) => {
        setSensorData((prev) => ({
          ...prev,
          accelerometer: {
            x: data.x,
            y: data.y,
            z: data.z,
            timestamp: data.timestamp,
          },
        }));
      });

      await bleService.subscribeToGyroscope((data) => {
        setSensorData((prev) => ({
          ...prev,
          gyroscope: {
            x: data.x,
            y: data.y,
            z: data.z,
            timestamp: data.timestamp,
          },
        }));
      });

      // Obtener nivel de batería
      const battery = await bleService.getBatteryLevel();
      setBatteryLevel(battery);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar');
      setIsConnected(false);
    }
  }, []);

  /**
   * Desconectar dispositivo
   */
  const disconnect = useCallback(async () => {
    try {
      await bleService.disconnect();
      setIsConnected(false);
      setConnectedDevice(null);
      setSensorData({
        accelerometer: null,
        gyroscope: null,
      });
      setBatteryLevel(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desconectar');
    }
  }, []);

  /**
   * Limpiar al desmontar
   */
  useEffect(() => {
    return () => {
      bleService.destroy();
    };
  }, []);

  return {
    // Estados
    isScanning,
    isConnected,
    availableDevices,
    connectedDevice,
    sensorData,
    batteryLevel,
    error,

    // Acciones
    scanDevices,
    connectToDevice,
    disconnect,
  };
}