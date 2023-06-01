import { Logger } from 'euberlog';

import { Database } from '@/database.js';
import { Bot } from '@/bot.js';

import options from '@/options.js';

const logger = new Logger({
    scope: 'BOT - index',
    debug: options.debugLog
});

async function createBot() {
    logger.info('Creating bot...');

    const database = new Database({
        url: options.redis.url
    });
    await database.open();
    logger.debug('Database instance created');

    const bot = new Bot(options.telegram.botToken, database);
    logger.success('Bot instance created!');

    return bot;
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
createBot();
