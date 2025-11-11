export interface SensorReading {
  timestamp: number;
  x: number;
  y: number;
  z: number;
  magnitude: number;
}

export interface TremorSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  readings: SensorReading[];
  tremorIndex: number;
  tremorStatus: 'Bajo' | 'Moderado' | 'Alto';
  heartRate?: number;
  notes?: string;
}

export interface HistoryFilters {
  startDate?: number;
  endDate?: number;
  minTremorIndex?: number;
  maxTremorIndex?: number;
  status?: 'Bajo' | 'Moderado' | 'Alto';
}

export interface PDFExportOptions {
  includeCharts: boolean;
  includeRawData: boolean;
  includeStatistics: boolean;
  sessions: TremorSession[];
  patientName?: string;
  doctorName?: string;
}

export interface SessionStatistics {
  totalSessions: number;
  averageTremorIndex: number;
  minTremorIndex: number;
  maxTremorIndex: number;
  totalDuration: number;
  sessionsPerStatus: {
    bajo: number;
    moderado: number;
    alto: number;
  };
}

// 🆕 BLE Types
export interface BLEDevice {
  id: string;
  name: string | null;
  rssi: number;
  isConnectable: boolean;
}

export interface BLEConnectionState {
  isScanning: boolean;
  isConnected: boolean;
  connectedDevice: BLEDevice | null;
  availableDevices: BLEDevice[];
  error: string | null;
}

export interface SensorDataStream {
  accelerometer: {
    x: number;
    y: number;
    z: number;
    timestamp: number;
  } | null;
  gyroscope: {
    x: number;
    y: number;
    z: number;
    timestamp: number;
  } | null;
}

export interface WatchSensorPacket {
  type: 'accelerometer' | 'gyroscope';
  x: number;
  y: number;
  z: number;
  timestamp: number;
  batteryLevel?: number;
}