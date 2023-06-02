import { FastifySchema } from 'fastify';

export const moistureSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            moisture: { type: 'number' },
            bed: { type: 'string' },
            timestamp: { type: 'string' }
        }
    }
};
