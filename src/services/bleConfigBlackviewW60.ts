// src/services/bleConfigBlackviewW60.ts
// 🎯 Configuración BLE específica para Blackview W60 (AT350DV000673)

export interface BlackviewW60Config {
  DEVICE_NAME: string;
  DEVICE_NAME_PREFIX: string;
  CHIPSET: string;
  COMPANION_APP: string;
  GENERIC_ACCESS_SERVICE: string;
  GENERIC_ATTRIBUTE_SERVICE: string;
  DEVICE_INFO_SERVICE: string;
  DEVICE_INFO_MANUFACTURER: string;
  DEVICE_INFO_MODEL: string;
  DEVICE_INFO_SERIAL: string;
  BATTERY_SERVICE: string;
  BATTERY_LEVEL: string;
  HEART_RATE_SERVICE: string;
  HEART_RATE_MEASUREMENT: string;
  BODY_SENSOR_LOCATION: string;
  HEALTH_THERMOMETER_SERVICE: string;
  TEMPERATURE_MEASUREMENT: string;
  MOTION_SERVICE: string;
  ACCELEROMETER_CHARACTERISTIC: string;
  GYROSCOPE_CHARACTERISTIC: string;
  CONNECTION_TIMEOUT: number;
  SCAN_TIMEOUT: number;
  MTU_SIZE: number;
  HEART_RATE_PARSER: (data: ArrayBuffer) => any;
  BATTERY_PARSER: (data: ArrayBuffer) => any;
  TEMPERATURE_PARSER: (data: ArrayBuffer) => any;
  ACCELEROMETER_PARSER: (data: ArrayBuffer) => any;
  GYROSCOPE_PARSER: (data: ArrayBuffer) => any;
}

export const BLACKVIEW_W60_CONFIG: BlackviewW60Config = {
  DEVICE_NAME: 'Blackview W60',
  DEVICE_NAME_PREFIX: 'Blackview',
  CHIPSET: 'AT350DV000673',
  COMPANION_APP: 'GloryFitPro',

  GENERIC_ACCESS_SERVICE: '00001800-0000-1000-8000-00805f9b34fb',

  GENERIC_ATTRIBUTE_SERVICE: '00001801-0000-1000-8000-00805f9b34fb',
  
  DEVICE_INFO_SERVICE: '0000180a-0000-1000-8000-00805f9b34fb',
  DEVICE_INFO_MANUFACTURER: '00002a29-0000-1000-8000-00805f9b34fb',
  DEVICE_INFO_MODEL: '00002a24-0000-1000-8000-00805f9b34fb',
  DEVICE_INFO_SERIAL: '00002a25-0000-1000-8000-00805f9b34fb',

  BATTERY_SERVICE: '0000180f-0000-1000-8000-00805f9b34fb',
  BATTERY_LEVEL: '00002a19-0000-1000-8000-00805f9b34fb', 

  HEART_RATE_SERVICE: '0000180d-0000-1000-8000-00805f9b34fb',
  HEART_RATE_MEASUREMENT: '00002a37-0000-1000-8000-00805f9b34fb', 
  BODY_SENSOR_LOCATION: '00002a38-0000-1000-8000-00805f9b34fb',

  HEALTH_THERMOMETER_SERVICE: '0000181a-0000-1000-8000-00805f9b34fb',
  TEMPERATURE_MEASUREMENT: '00002a1c-0000-1000-8000-00805f9b34fb',

  MOTION_SERVICE: 'fe90',
  ACCELEROMETER_CHARACTERISTIC: 'fe91',
  GYROSCOPE_CHARACTERISTIC: 'fe92',

  CONNECTION_TIMEOUT: 15000,
  SCAN_TIMEOUT: 10000,
  MTU_SIZE: 512,
  
  HEART_RATE_PARSER: (data: ArrayBuffer) => {
    const view = new Uint8Array(data);
    return {
      heartRate: view[0],
      unit: 'bpm',
      contact: (view[0] & 0x01) === 1,
    };
  },

  BATTERY_PARSER: (data: ArrayBuffer) => {
    const view = new Uint8Array(data);
    return {
      level: view[0],
      unit: '%',
    };
  },

  TEMPERATURE_PARSER: (data: ArrayBuffer) => {
    const view = new DataView(data);
    const temp = view.getInt16(1, true) / 100;
    return {
      temperature: temp,
      unit: '°C',
    };
  },

  ACCELEROMETER_PARSER: (data: ArrayBuffer) => {
    const view = new DataView(data);
    return {
      x: view.getInt16(0, true) / 1000,
      y: view.getInt16(2, true) / 1000,
      z: view.getInt16(4, true) / 1000,
      unit: 'm/s²',
      timestamp: Date.now(),
    };
  },

  GYROSCOPE_PARSER: (data: ArrayBuffer) => {
    const view = new DataView(data);
    return {
      x: view.getInt16(0, true) / 1000,
      y: view.getInt16(2, true) / 1000,
      z: view.getInt16(4, true) / 1000,
      unit: 'rad/s',
      timestamp: Date.now(),
    };
  },
};