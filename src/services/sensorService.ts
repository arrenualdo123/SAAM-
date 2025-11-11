import { SensorReading, WatchSensorPacket } from '../types';
import { TREMOR_FREQUENCY_MIN, TREMOR_FREQUENCY_MAX } from '../utils/constants';

export class SensorService {
  /**
   * Procesar datos del acelerómetro
   */
  static processAccelerometerData(packet: WatchSensorPacket): SensorReading {
    const magnitude = Math.sqrt(
      Math.pow(packet.x, 2) + 
      Math.pow(packet.y, 2) + 
      Math.pow(packet.z, 2)
    );

    return {
      timestamp: packet.timestamp,
      x: packet.x,
      y: packet.y,
      z: packet.z,
      magnitude,
    };
  }

  /**
   * Calcular índice de tremor basado en lecturas
   */
  static calculateTremorIndex(readings: SensorReading[]): number {
    if (readings.length === 0) return 0;

    // Calcular promedio de magnitudes
    const avgMagnitude = readings.reduce((sum, r) => sum + r.magnitude, 0) / readings.length;

    // Calcular desviación estándar
    const variance = readings.reduce((sum, r) => 
      sum + Math.pow(r.magnitude - avgMagnitude, 2), 0
    ) / readings.length;
    const stdDev = Math.sqrt(variance);

    // Normalizar a 0-100
    // Mayor desviación = más tremor
    const tremorIndex = Math.min(100, Math.max(0, (stdDev * 50)));

    return Math.round(tremorIndex);
  }

  /**
   * Detectar picos de tremor (simple peak detection)
   */
  static detectTremorPeaks(readings: SensorReading[], threshold: number = 0.5): number[] {
    const peaks: number[] = [];

    for (let i = 1; i < readings.length - 1; i++) {
      const current = readings[i].magnitude;
      const prev = readings[i - 1].magnitude;
      const next = readings[i + 1].magnitude;

      // Es un pico si es mayor que sus vecinos y supera el umbral
      if (current > prev && current > next && current > threshold) {
        peaks.push(i);
      }
    }

    return peaks;
  }

  /**
   * Calcular frecuencia dominante (simplificado)
   */
  static calculateDominantFrequency(readings: SensorReading[]): number {
    if (readings.length < 10) return 0;

    const peaks = this.detectTremorPeaks(readings);
    
    if (peaks.length < 2) return 0;

    // Calcular intervalos entre picos
    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      const timeDiff = (readings[peaks[i]].timestamp - readings[peaks[i - 1]].timestamp) / 1000;
      if (timeDiff > 0) {
        intervals.push(timeDiff);
      }
    }

    if (intervals.length === 0) return 0;

    // Frecuencia promedio = 1 / intervalo promedio
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const frequency = 1 / avgInterval;

    return frequency;
  }

  /**
   * Verificar si está en rango de tremor de Parkinson (4-6 Hz)
   */
  static isParkinsonTremorRange(frequency: number): boolean {
    return frequency >= TREMOR_FREQUENCY_MIN && frequency <= TREMOR_FREQUENCY_MAX;
  }

  /**
   * Clasificar severidad del tremor
   */
  static classifyTremorSeverity(tremorIndex: number): 'Bajo' | 'Moderado' | 'Alto' {
    if (tremorIndex > 66) return 'Alto';
    if (tremorIndex > 33) return 'Moderado';
    return 'Bajo';
  }

  /**
   * Aplicar filtro de media móvil simple
   */
  static applyMovingAverage(readings: SensorReading[], windowSize: number = 5): SensorReading[] {
    if (readings.length < windowSize) return readings;

    const smoothed: SensorReading[] = [];

    for (let i = 0; i < readings.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(readings.length, i + Math.ceil(windowSize / 2));
      const window = readings.slice(start, end);

      const avgX = window.reduce((sum, r) => sum + r.x, 0) / window.length;
      const avgY = window.reduce((sum, r) => sum + r.y, 0) / window.length;
      const avgZ = window.reduce((sum, r) => sum + r.z, 0) / window.length;
      const avgMag = window.reduce((sum, r) => sum + r.magnitude, 0) / window.length;

      smoothed.push({
        timestamp: readings[i].timestamp,
        x: avgX,
        y: avgY,
        z: avgZ,
        magnitude: avgMag,
      });
    }

    return smoothed;
  }

  /**
   * Detectar anomalías (valores atípicos)
   */
  static detectAnomalies(readings: SensorReading[]): number[] {
    if (readings.length < 10) return [];

    const magnitudes = readings.map(r => r.magnitude);
    const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
    const variance = magnitudes.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) / magnitudes.length;
    const stdDev = Math.sqrt(variance);

    const anomalies: number[] = [];
    const threshold = 3; // 3 desviaciones estándar

    magnitudes.forEach((magnitude, index) => {
      if (Math.abs(magnitude - mean) > threshold * stdDev) {
        anomalies.push(index);
      }
    });

    return anomalies;
  }

  /**
   * Generar resumen de análisis
   */
  static generateAnalysisSummary(readings: SensorReading[]) {
    const tremorIndex = this.calculateTremorIndex(readings);
    const frequency = this.calculateDominantFrequency(readings);
    const severity = this.classifyTremorSeverity(tremorIndex);
    const peaks = this.detectTremorPeaks(readings);
    const anomalies = this.detectAnomalies(readings);
    const isParkinson = this.isParkinsonTremorRange(frequency);

    return {
      tremorIndex,
      frequency: parseFloat(frequency.toFixed(2)),
      severity,
      peakCount: peaks.length,
      anomalyCount: anomalies.length,
      isParkinsonRange: isParkinson,
      totalReadings: readings.length,
      avgMagnitude: readings.reduce((sum, r) => sum + r.magnitude, 0) / readings.length,
    };
  }
}