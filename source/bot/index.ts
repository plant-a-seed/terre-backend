import { Logger } from 'euberlog';

import options from '@options';

import { Database } from '@bot/utils/database.js';
import { TerreBot } from '@bot/utils/bot.js';

const logger = new Logger({
    scope: 'BOT - index',
    debug: options.debugLog
});

export async function createBot(): Promise<TerreBot> {
    logger.info('Creating bot...');

    const database = new Database({
        url: options.redis.url
    });
    await database.open();
    logger.debug('Database instance created');

    const bot = new TerreBot(options.telegram.botToken, database);
    logger.success('Bot instance created!');

    return bot;
}
