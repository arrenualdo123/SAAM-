import { useState, useEffect, useCallback } from 'react';
import { SensorReading } from '../types';
import { GloryFitProBridgeService } from '../services/gloryFitProBridge';

export interface GloryFitBridgeState {
  isAvailable: boolean;
  isLoading: boolean;
  data: SensorReading[];
  lastSync: Date | null;
  recordCount: number;
  error: string | null;
}

export function useGloryFitBridge(autoSync: boolean = true, syncInterval: number = 5) {
  const [state, setState] = useState<GloryFitBridgeState>({
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
        console.log('🔌 Inicializando GloryFitPro Bridge...');
        const initialized = await GloryFitProBridgeService.initialize();

        if (initialized) {
          setState((prev) => ({
            ...prev,
            isAvailable: true,
          }));
          console.log('✅ Bridge disponible');
        } else {
          setState((prev) => ({
            ...prev,
            isAvailable: false,
            error: 'GloryFitPro no disponible',
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
        error: 'GloryFitPro Bridge no disponible',
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const success = await GloryFitProBridgeService.syncDataToStorage();

      if (success) {
        // Obtener datos sincronizados
        const data = await GloryFitProBridgeService.getSyncedData();
        const syncInfo = await GloryFitProBridgeService.getLastSyncInfo();

        setState((prev) => ({
          ...prev,
          isLoading: false,
          data,
          lastSync: syncInfo ? new Date(syncInfo.timestamp) : new Date(),
          recordCount: data.length,
          error: null,
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

      const rawData = await GloryFitProBridgeService.getLatestSensorData(500);
      const readings = rawData.map((d) =>
        GloryFitProBridgeService.convertToSensorReading(d)
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
      await GloryFitProBridgeService.clearSyncedData();
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
      GloryFitProBridgeService.startAutoSync(syncInterval);
      return () => {
        GloryFitProBridgeService.stopAutoSync();
      };
    }
  }, [autoSync, state.isAvailable, syncInterval]);

  /**
   * Cleanup al desmontar
   */
  useEffect(() => {
    return () => {
      GloryFitProBridgeService.destroy();
    };
  }, []);

  return {
    ...state,
    syncNow,
    fetchDataOnly,
    clearData,
  };
}