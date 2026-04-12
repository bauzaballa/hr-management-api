// src/core/dayjs.ts
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Extender con los plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Establecer la zona horaria global (ej: Argentina)
dayjs.tz.setDefault('America/Argentina/Buenos_Aires');

export default dayjs;
