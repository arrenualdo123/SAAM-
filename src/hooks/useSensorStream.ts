import { useState, useEffect, useCallback } from 'react';
import { SensorReading } from '../types';
import { SensorService } from '../services/sensorService';
import { useBLEConnection } from './useBLEConnection';

export function useSensorStream(maxReadings: number = 500) {
  const { sensorData } = useBLEConnection();
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [tremorIndex, setTremorIndex] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [severity, setSeverity] = useState<'Bajo' | 'Moderado' | 'Alto'>('Bajo');

  // Procesar datos del acelerómetro cuando llegan
  useEffect(() => {
    if (!sensorData.accelerometer) return;

    const reading: SensorReading = {
      timestamp: sensorData.accelerometer.timestamp,
      x: sensorData.accelerometer.x,
      y: sensorData.accelerometer.y,
      z: sensorData.accelerometer.z,
      magnitude: Math.sqrt(
        Math.pow(sensorData.accelerometer.x, 2) +
        Math.pow(sensorData.accelerometer.y, 2) +
        Math.pow(sensorData.accelerometer.z, 2)
      ),
    };

    setReadings(prev => [...prev, reading].slice(-maxReadings));
  }, [sensorData.accelerometer, maxReadings]);

  // Calcular métricas cada vez que se actualizan las lecturas
  useEffect(() => {
    if (readings.length < 10) return;

    // Aplicar filtro suavizado
    const smoothed = SensorService.applyMovingAverage(readings, 5);

    // Calcular índice de tremor
    const index = SensorService.calculateTremorIndex(smoothed);
    setTremorIndex(index);

    // Calcular frecuencia
    const freq = SensorService.calculateDominantFrequency(smoothed);
    setFrequency(freq);

    // Clasificar severidad
    const sev = SensorService.classifyTremorSeverity(index);
    setSeverity(sev);
  }, [readings]);

  // Limpiar lecturas
  const clearReadings = useCallback(() => {
    setReadings([]);
    setTremorIndex(0);
    setFrequency(0);
    setSeverity('Bajo');
  }, []);

  // Obtener resumen de análisis
  const getAnalysisSummary = useCallback(() => {
    if (readings.length === 0) return null;
    return SensorService.generateAnalysisSummary(readings);
  }, [readings]);

  return {
    readings,
    tremorIndex,
    frequency,
    severity,
    clearReadings,
    getAnalysisSummary,
  };
}