import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { DeviceType } from 'expo-device';
import { TremorSession } from '../types';
import { StorageService } from './storageService';
import { PDFService } from './pdfService';

export interface SyncStatus {
    lastSync: number | null;
    pendingSessions: number;
    isConnected: boolean;
    deviceType: 'watch' | 'phone';
}
export class SyncService {
    private static SYNC_KEY = '@parkinson_sync_status';
    private static PENDING_KEY = '@pending_sessions';

    static isWearOS(): boolean {
        const {width} = require('react-native').Dimensions.get('window');
        const WATCH_DEVICE_TYPE = (DeviceType as any).WATCH as number;
        return width < 300 || Device.deviceType === WATCH_DEVICE_TYPE;
    }
    static async markSessionsForSync(sessionIds: string[]): Promise<void>{
        try {
            const pending = await this.getPendingSessions();
            const updated = [...new Set([...pending, ...sessionIds])];
            await StorageService.saveCurrentSession({ 
        id: this.PENDING_KEY, 
        readings: updated as any 
      });
    } catch (error) {
      console.error('Error marking sessions for sync:', error); 
        }
    }
    static async getPendingSessions(): Promise<string[]> {
    try {
      const data = await StorageService.getCurrentSession();
      return (data?.readings as any) || [];
    } catch (error) {
      return [];
    }
  }
  static async getSessionsToSync(): Promise<TremorSession[]> {
    const pendingIds = await this.getPendingSessions();
    const allSessions = await StorageService.getAllSessions();
    
    return allSessions.filter(session => 
      pendingIds.includes(session.id)
    );
  }
  static async prepareDataForTransfer(): Promise<string> {
    const sessions = await this.getSessionsToSync();
    
    const compressed = sessions.map(session => ({
      ...session,
      readings: session.readings.length > 500 
        ? this.sampleReadings(session.readings, 500)
        : session.readings,
    }));

    return JSON.stringify(compressed);
  }
   private static sampleReadings(readings: any[], maxCount: number): any[] {
    if (readings.length <= maxCount) return readings;
    
    const step = readings.length / maxCount;
    const sampled = [];
    
    for (let i = 0; i < readings.length; i += step) {
      sampled.push(readings[Math.floor(i)]);
    }
    
    return sampled.slice(0, maxCount);
  }
  static async receiveData(jsonData: string): Promise<TremorSession[]> {
    try {
      const sessions: TremorSession[] = JSON.parse(jsonData);
      
      // Guardar sesiones en el teléfono
      for (const session of sessions) {
        await StorageService.saveSession(session);
      }
      
      return sessions;
    } catch (error) {
      console.error('Error receiving data:', error);
      return [];
    }
  }
  static async autoGeneratePDF(sessions: TremorSession[]): Promise<string | null> {
    if (sessions.length === 0) return null;

    try {
      const fileUri = await PDFService.exportToPDF({
        sessions,
        includeStatistics: true,
        includeCharts: true,
        includeRawData: false,
      });

      return fileUri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  }
  static async markAsSynced(sessionIds: string[]): Promise<void> {
    const pending = await this.getPendingSessions();
    const updated = pending.filter(id => !sessionIds.includes(id));
    
    await StorageService.saveCurrentSession({ 
      id: this.PENDING_KEY, 
      readings: updated as any 
    });
  }
  static async getSyncStatus(): Promise<SyncStatus> {
    const pending = await this.getPendingSessions();
    
    return {
      lastSync: null, 
      pendingSessions: pending.length,
      isConnected: false, 
      deviceType: this.isWearOS() ? 'watch' : 'phone',
    };
  }
   static async cleanupSyncedData(sessionIds: string[]): Promise<void> {
    for (const id of sessionIds) {
      await StorageService.deleteSession(id);
    }
  }
}