import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { PDFExportOptions, SessionStatistics, TremorSession } from '../types';

export class PDFService {

  static calculateStatistics(sessions: TremorSession[]): SessionStatistics {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageTremorIndex: 0,
        minTremorIndex: 0,
        maxTremorIndex: 0,
        totalDuration: 0,
        sessionsPerStatus: { bajo: 0, moderado: 0, alto: 0 },
      };
    }

    const tremorIndices = sessions.map(s => s.tremorIndex);
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      totalSessions: sessions.length,
      averageTremorIndex: Math.round(tremorIndices.reduce((a, b) => a + b, 0) / sessions.length),
      minTremorIndex: Math.min(...tremorIndices),
      maxTremorIndex: Math.max(...tremorIndices),
      totalDuration,
      sessionsPerStatus: {
        bajo: sessions.filter(s => s.tremorStatus === 'Bajo').length,
        moderado: sessions.filter(s => s.tremorStatus === 'Moderado').length,
        alto: sessions.filter(s => s.tremorStatus === 'Alto').length,
      },
    };
  }

  static generateHTML(options: PDFExportOptions): string {
    const stats = this.calculateStatistics(options.sessions);
    const currentDate = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #89C2AF;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #89C2AF;
      margin: 0;
      font-size: 32px;
    }
    .header p {
      color: #666;
      margin: 5px 0;
    }
    .info-box {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .info-box h3 {
      margin-top: 0;
      color: #89C2AF;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: white;
      border: 2px solid #89C2AF;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-card h4 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
    }
    .stat-card p {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #89C2AF;
    }
    .session {
      border: 1px solid #ddd;
      padding: 15px;
      margin: 15px 0;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .session-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .tremor-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 15px;
      font-weight: bold;
      font-size: 12px;
    }
    .tremor-bajo { background: #6bcf7f; color: white; }
    .tremor-moderado { background: #ffd93d; color: #333; }
    .tremor-alto { background: #ff6b6b; color: white; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #89C2AF;
      color: white;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #89C2AF;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧠 Reporte de Monitoreo de Parkinson</h1>
    <p>Generado el ${currentDate}</p>
    ${options.patientName ? `<p><strong>Paciente:</strong> ${options.patientName}</p>` : ''}
    ${options.doctorName ? `<p><strong>Doctor:</strong> ${options.doctorName}</p>` : ''}
  </div>

  ${options.includeStatistics ? `
  <div class="info-box">
    <h3>📊 Estadísticas Generales</h3>
    <div class="stats-grid">
      <div class="stat-card">
        <h4>Total de Sesiones</h4>
        <p>${stats.totalSessions}</p>
      </div>
      <div class="stat-card">
        <h4>Índice Promedio</h4>
        <p>${stats.averageTremorIndex}%</p>
      </div>
      <div class="stat-card">
        <h4>Duración Total</h4>
        <p>${Math.floor(stats.totalDuration / 60)} min</p>
      </div>
      <div class="stat-card">
        <h4>Rango</h4>
        <p>${stats.minTremorIndex}% - ${stats.maxTremorIndex}%</p>
      </div>
    </div>
    
    <h4>Distribución por Estado:</h4>
    <ul>
      <li>🟢 Bajo: ${stats.sessionsPerStatus.bajo} sesiones</li>
      <li>🟡 Moderado: ${stats.sessionsPerStatus.moderado} sesiones</li>
      <li>🔴 Alto: ${stats.sessionsPerStatus.alto} sesiones</li>
    </ul>
  </div>
  ` : ''}

  <h2>📋 Historial de Sesiones</h2>
  ${options.sessions.map((session, idx) => `
    <div class="session">
      <div class="session-header">
        <div>
          <strong>Sesión ${idx + 1}</strong><br>
          <small>${new Date(session.startTime).toLocaleString('es-MX')}</small>
        </div>
        <div>
          <span class="tremor-badge tremor-${session.tremorStatus.toLowerCase()}">
            ${session.tremorStatus}
          </span>
        </div>
      </div>
      <p><strong>Índice de Tremor:</strong> ${session.tremorIndex}%</p>
      <p><strong>Duración:</strong> ${Math.floor(session.duration / 60)}:${String(session.duration % 60).padStart(2, '0')} minutos</p>
      ${session.heartRate ? `<p><strong>Frecuencia Cardíaca:</strong> ${session.heartRate} BPM</p>` : ''}
      ${session.notes ? `<p><strong>Notas:</strong> ${session.notes}</p>` : ''}
      
      ${options.includeRawData ? `
        <details>
          <summary style="cursor: pointer; color: #89C2AF; font-weight: bold;">Ver datos crudos (${session.readings.length} lecturas)</summary>
          <table>
            <tr>
              <th>Tiempo</th>
              <th>X</th>
              <th>Y</th>
              <th>Z</th>
              <th>Magnitud</th>
            </tr>
            ${session.readings.slice(0, 20).map(r => `
              <tr>
                <td>${new Date(r.timestamp).toLocaleTimeString('es-MX')}</td>
                <td>${r.x.toFixed(3)}</td>
                <td>${r.y.toFixed(3)}</td>
                <td>${r.z.toFixed(3)}</td>
                <td>${r.magnitude.toFixed(3)}</td>
              </tr>
            `).join('')}
            ${session.readings.length > 20 ? `<tr><td colspan="5" style="text-align: center; color: #666;"><em>... y ${session.readings.length - 20} lecturas más</em></td></tr>` : ''}
          </table>
        </details>
      ` : ''}
    </div>
  `).join('')}

  <div class="footer">
    <p>Este reporte fue generado automáticamente por la aplicación Parkinson Detector</p>
    <p>Para uso médico profesional únicamente</p>
  </div>
</body>
</html>
    `;
  }

  static async exportToPDF(options: PDFExportOptions): Promise<string> {
    try {
      const html = this.generateHTML(options);
      const fileName = `parkinson_report_${Date.now()}.html`;
      
      const fileUri = `${(FileSystem as any).cacheDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, html, {
        encoding: 'utf8', 
      });

      return fileUri;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }

  static async sharePDF(fileUri: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/html',
        dialogTitle: 'Compartir Reporte de Parkinson',
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
      throw error;
    }
  }
}