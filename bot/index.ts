import { Logger } from 'euberlog';

import { Database } from '@/database.js';
import { Bot } from '@/bot.js';

import OPTIONS from '@/options.js';

const logger = new Logger({
    scope: 'main',
    debug: OPTIONS.debugLog
});

async function createBot() {
    logger.info('Creating bot...');

    const database = new Database({
        url: OPTIONS.redis.url
    });
    await database.open();
    logger.debug('Database instance created');

    const bot = new Bot(OPTIONS.telegram.botToken, database);
    logger.success('Bot instance created!');

    return bot;
}
createBot();