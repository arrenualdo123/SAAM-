import { useState, useEffect, useCallback } from 'react';
import { SensorReading } from '../types';
import { HuaweiHealthBridgeService } from '../services/huaweiHealthBridge';

export interface HuaweiHealthBridgeState {
  isAvailable: boolean;
  isLoading: boolean;
  data: SensorReading[];
  lastSync: Date | null;
  recordCount: number;
  error: string | null;
  heartRateAvg?: number;
  stepsToday?: number;
}

export function useHuaweiHealthBridge(autoSync: boolean = true, syncInterval: number = 2) {
  const [state, setState] = useState<HuaweiHealthBridgeState>({
    isAvailable: false,
    isLoading: false,
    data: [],
    lastSync: null,
    recordCount: 0,
    error: null,
  });

  /**
   * Inicializar Bridge
   */
  useEffect(() => {
    const initBridge = async () => {
      try {
        console.log('🔌 Inicializando Huawei Health Bridge...');
        const initialized = await HuaweiHealthBridgeService.initialize();

        if (initialized) {
          setState((prev) => ({
            ...prev,
            isAvailable: true,
          }));
          console.log('✅ Huawei Health Bridge disponible');
        } else {
          setState((prev) => ({
            ...prev,
            isAvailable: false,
            error: 'Huawei Health no disponible',
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }));
      }
    };

    initBridge();
  }, []);

  /**
   * Sincronizar datos manualmente
   */
  const syncNow = useCallback(async () => {
    if (!state.isAvailable) {
      setState((prev) => ({
        ...prev,
        error: 'Huawei Health Bridge no disponible',
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const success = await HuaweiHealthBridgeService.syncDataToStorage();

      if (success) {
        // Obtener datos sincronizados
        const data = await HuaweiHealthBridgeService.getSyncedData();
        const syncInfo = await HuaweiHealthBridgeService.getLastSyncInfo();
        const todayData = await HuaweiHealthBridgeService.getTodayData();

        setState((prev) => ({
          ...prev,
          isLoading: false,
          data,
          lastSync: syncInfo ? new Date(syncInfo.timestamp) : new Date(),
          recordCount: data.length,
          error: null,
          heartRateAvg: todayData.heartRateAvg,
          stepsToday: todayData.stepsToday,
        }));

        console.log(`✅ Sincronización exitosa: ${data.length} registros`);
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Error en sincronización',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  }, [state.isAvailable]);

  /**
   * Obtener datos sin sincronizar
   */
  const fetchDataOnly = useCallback(async () => {
    if (!state.isAvailable) {
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const rawData = await HuaweiHealthBridgeService.getLatestSensorData(500);
      const readings = rawData.map((d) =>
        HuaweiHealthBridgeService.convertToSensorReading(d)
      );

      setState((prev) => ({
        ...prev,
        isLoading: false,
        data: readings,
        recordCount: readings.length,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error',
      }));
    }
  }, [state.isAvailable]);

  /**
   * Limpiar datos
   */
  const clearData = useCallback(async () => {
    try {
      await HuaweiHealthBridgeService.clearSyncedData();
      setState((prev) => ({
        ...prev,
        data: [],
        lastSync: null,
        recordCount: 0,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error',
      }));
    }
  }, []);

  /**
   * Iniciar/detener auto-sync
   */
  useEffect(() => {
    if (autoSync && state.isAvailable) {
      HuaweiHealthBridgeService.startAutoSync(syncInterval);
      return () => {
        HuaweiHealthBridgeService.stopAutoSync();
      };
    }
  }, [autoSync, state.isAvailable, syncInterval]);

  /**
   * Cleanup al desmontar
   */
  useEffect(() => {
    return () => {
      HuaweiHealthBridgeService.destroy();
    };
  }, []);

  return {
    ...state,
    syncNow,
    fetchDataOnly,
    clearData,
  };
}