import { Logger } from 'euberlog';

import options from '@options';
import { Moisture } from '@types';

import { TerreBot } from '@/bot/utils/bot.js';
import { Database } from '@/bot/utils/database.js';

const logger = new Logger({
    scope: 'handleWatering',
    debug: options.debugLog
});

const state = {
    needsWatering: false
};

async function getHandledMoisture(database: Database): Promise<number> {
    const min = await database.getMinMoisture();
    return min ?? options.thresholds.defaultMinMoisture;
}

export async function handleWatering(
    { moisture, bed, timestamp }: Moisture,
    bot: TerreBot,
    database: Database
): Promise<void> {
    const parsedTimestamp = new Date(timestamp);
    if (Number.isNaN(parsedTimestamp.getTime())) {
        logger.warning('Invalid timestamp', timestamp);
        return;
    }
    if (parsedTimestamp.getTime() > Date.now()) {
        logger.warning('Timestamp in the future', timestamp);
        return;
    }
    if (parsedTimestamp.getTime() < Date.now() - 3_600_000) {
        logger.warning('Timestamp too old', timestamp);
        return;
    }

    const minMoisture = await getHandledMoisture(database);
    const handledReceivedMoisture = Math.abs(options.thresholds.maxPossibleMoisture - moisture);

    if (handledReceivedMoisture < minMoisture && !state.needsWatering) {
        logger.info('Needs watering', { handledReceivedMoisture, timestamp, bed });
        state.needsWatering = true;
        await bot.sendWateringNotification(bed, handledReceivedMoisture, state.needsWatering);
    } else if (handledReceivedMoisture >= minMoisture && state.needsWatering) {
        logger.info('Does not need watering', { handledReceivedMoisture, timestamp, bed });
        state.needsWatering = false;
        await bot.sendWateringNotification(bed, handledReceivedMoisture, state.needsWatering);
    }
}
