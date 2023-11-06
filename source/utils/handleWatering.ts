import { Logger } from 'euberlog';

import options from '@options';
import { Moisture } from '@types';

import { TerreBot } from '@/bot/utils/bot.js';

const logger = new Logger({
    scope: 'handleWatering',
    debug: options.debugLog
});

const state = {
    needsWatering: false
};

export async function handleWatering({ moisture, bed, timestamp }: Moisture, bot: TerreBot): Promise<void> {
    const parsedTimestamp = new Date(timestamp);
    if (Number.isNaN(parsedTimestamp.getTime())) {
        logger.warning('Invalid timestamp', timestamp);
        return;
    }
    // if (parsedTimestamp.getTime() > Date.now()) {
    //     logger.warning('Timestamp in the future', timestamp);
    //     return;
    // }
    // if (parsedTimestamp.getTime() < Date.now() - 3_600_000) {
    //     logger.warning('Timestamp too old', timestamp);
    //     return;
    // }

    if (moisture < options.thresholds.minMoisture && !state.needsWatering) {
        logger.info('Needs watering', { moisture, timestamp, bed });
        state.needsWatering = true;
        await bot.sendWateringNotification(bed, moisture, state.needsWatering);
    } else if (moisture >= options.thresholds.minMoisture && state.needsWatering) {
        logger.info('Does not need watering', { moisture, timestamp, bed });
        state.needsWatering = false;
        await bot.sendWateringNotification(bed, moisture, state.needsWatering);
    }
}
