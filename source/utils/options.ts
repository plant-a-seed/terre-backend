import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));

dotenv.config({
    path: path.join(process.cwd(), '.env')
});

const redisHost = process.env.REDIS_HOST ?? 'localhost';
const redisPort = process.env.REDIS_PORT ?? 6379;

export default {
    api: {
        port: process.env.API_PORT ? +process.env.API_PORT : 3000
    },
    redis: {
        host: redisHost,
        port: redisPort,
        url: `redis://${redisHost}:${redisPort}`
    },
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN as string
    },
    thresholds: {
        minMoisture: process.env.THRESHOLDS_MIN_MOISTURE ? +process.env.THRESHOLDS_MIN_MOISTURE : 0.3
    },
    debugLog: process.env.DEBUG_LOG === 'true',
    version: packageJson.version as string
};
