import { useState, useEffect, useRef } from 'react';
import { TremorSession, SensorReading } from '../types';
import { StorageService } from '../services/storageService';

export function useTremorSession() {
  const [isActive, setIsActive] = useState(false);
  const [sessionData, setSessionData] = useState<SensorReading[]>([]);
  const [tremorIndex, setTremorIndex] = useState(45);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);

  // Iniciar sesión
  const startSession = () => {
    const id = `session_${Date.now()}`;
    setSessionId(id);
    setIsActive(true);
    setSessionData([]);
    startTimeRef.current = Date.now();
  };

  // Agregar lectura de sensor
  const addReading = (x: number, y: number, z: number) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const reading: SensorReading = {
      timestamp: Date.now(),
      x,
      y,
      z,
      magnitude,
    };

    setSessionData(prev => [...prev, reading].slice(-1000)); // Mantener últimas 1000 lecturas
  };

  // Calcular índice de tremor
  useEffect(() => {
    if (sessionData.length === 0) {
      setTremorIndex(45);
      return;
    }

    // Calcular promedio de magnitudes
    const avg = sessionData.reduce((sum, r) => sum + r.magnitude, 0) / sessionData.length;
    
    // Normalizar a 0-100
    const normalized = Math.min(100, Math.max(0, (avg * 10)));
    setTremorIndex(Math.round(normalized));
  }, [sessionData]);

  // Detener y guardar sesión
  const stopSession = async (notes?: string) => {
    if (!sessionId || !isActive) return null;

    const endTime = Date.now();
    const duration = Math.floor((endTime - startTimeRef.current) / 1000);

    const getTremorStatus = () => {
      if (tremorIndex > 66) return 'Alto';
      if (tremorIndex > 33) return 'Moderado';
      return 'Bajo';
    };

    const session: TremorSession = {
      id: sessionId,
      startTime: startTimeRef.current,
      endTime,
      duration,
      readings: sessionData,
      tremorIndex,
      tremorStatus: getTremorStatus(),
      notes,
    };

    try {
      await StorageService.saveSession(session);
      setIsActive(false);
      setSessionData([]);
      setSessionId(null);
      return session;
    } catch (error) {
      console.error('Error saving session:', error);
      return null;
    }
  };

  // Pausar sesión (guardar estado actual)
  const pauseSession = async () => {
    if (!sessionId) return;
    
    await StorageService.saveCurrentSession({
      id: sessionId,
      startTime: startTimeRef.current,
      readings: sessionData,
    });
    setIsActive(false);
  };

  // Reanudar sesión
  const resumeSession = async () => {
    const current = await StorageService.getCurrentSession();
    if (current && current.id && current.startTime) {
      setSessionId(current.id);
      startTimeRef.current = current.startTime;
      setSessionData(current.readings || []);
      setIsActive(true);
    }
  };

  return {
    isActive,
    sessionData,
    tremorIndex,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    addReading,
  };
}