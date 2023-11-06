import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Logger } from 'euberlog';

import options from '@options';
import { Moisture } from '@types';

import { createBot } from '@/bot/index.js';
import { moistureSchema } from '@/utils/schemas.js';
import { handleWatering } from '@/utils/handleWatering.js';

const logger = new Logger({
    scope: 'main',
    debug: options.debugLog
});

async function main() {
    logger.info(`Starting bot`);
    const bot = await createBot();

    logger.info(`Starting api`);
    const fastify = Fastify({
        logger: options.debugLog
    });
    await fastify.register(cors);

    fastify.post('/moisture', { schema: moistureSchema }, async (request, reply) => {
        const body = request.body as Moisture;
        // TODO: remove for when sent from ESP32
        body.timestamp = Date.now();
        logger.debug('Received moisture data', body);
        await reply.send();

        await handleWatering(body, bot);
    });

    const address = await fastify.listen({ port: options.api.port, host: options.api.host });
    logger.success(`Server listening on ${address}`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
