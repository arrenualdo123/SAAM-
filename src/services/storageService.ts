import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryFilters, TremorSession } from '../types';

const STORAGE_KEYS = {
    SESSIONS: '@parkinson_sessions',
    CURRENT_SESSION: '@current_session',
};

export class StorageService {
    static async saveSession(session: TremorSession): Promise<void> {
       try {
        const sessions = await this.getAllSessions();
        sessions.push(session);
        await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
       } catch (error) {
        console.error('Error al guardar sesion:', error);
        throw error;
       }
    }
    static async getAllSessions(): Promise<TremorSession[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
                return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting sessions', error);
            return [];
        }
    }
    static async getFilteredSessions(filters: HistoryFilters): Promise<TremorSession[]>{
        const sessions = await this.getAllSessions();

        return sessions.filter(session => {
            if (filters.startDate && session.startTime < filters.startDate) return false;
            if (filters.endDate && session.endTime > filters.endDate) return false;
            if (filters.minTremorIndex && session.tremorIndex < filters.minTremorIndex) return false;
            if (filters.maxTremorIndex && session.tremorIndex > filters.maxTremorIndex) return false;
            if (filters.status && session.tremorStatus !== filters.status) return false;
            return true;
        });
    }
    static async getSessionById(id: string): Promise<TremorSession | null> {
        const sessions = await this.getAllSessions();
        return sessions.find(s => s.id === id) || null;
    }
    static async deleteSession(id: string): Promise<void> {
        const sessions = await this.getAllSessions();
        const filtered = sessions.filter(s => s.id !== id);
        await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
    }
    static async clearAllSessions(): Promise<void>{
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS);
    }
    static async saveCurrentSession(session: Partial<TremorSession>): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    }
    static async getCurrentSession(): Promise<Partial<TremorSession> | null> {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
        return data ? JSON.parse(data) : null;
    }
    static async clearCurrentSession(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
    static async exportToJSON(): Promise<string>{
        const sessions = await this.getAllSessions();
        return JSON.stringify(sessions, null, 2);
    }
    static async importFromJSON(jsonString: string): Promise<void>{
        try {
            const sessions = JSON.parse(jsonString) as TremorSession[];
            await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
        } catch (error) {
          console.error('Error al importar sesion:', error);
          throw error;  
        }
    }
}