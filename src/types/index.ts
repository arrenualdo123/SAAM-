export interface SensorReading {
    timestamp: number;
    x: number;
    y: number;
    z: number;
    magnitude: number;
}

export interface TremorSession {
    id: number;
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
    status?: 'Bajo' | 'Moderado'| 'Alto';
}

export interface PDFExportOptions {
    includeCharts: boolean;
    includeRawData: boolean;
    includeStatistics: boolean;
    sessions: TremorSession[];
    patientName?: string;
    doctorName?: string;
}

export interface SessionStatistics{
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