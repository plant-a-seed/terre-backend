import redis, { RedisClientType, RedisClientOptions } from 'redis';

export class Database {
    private static readonly MIN_MOISTURE_KEY = 'terreMinMoistureKey';
    private static readonly CHATS_KEY = 'terreChatsKey';

    private readonly client: RedisClientType;

    constructor(options: RedisClientOptions) {
        this.client = redis.createClient(options) as RedisClientType;
    }

    public async open(): Promise<void> {
        await this.client.connect();
    }

    public async getMinMoisture(): Promise<number | null> {
        const min = await this.client.get(Database.MIN_MOISTURE_KEY);
        return min ? +min : null;
    }

    public async setMinMoisture(min: number): Promise<void> {
        await this.client.set(Database.MIN_MOISTURE_KEY, String(min));
    }

    public async getChats(): Promise<number[]> {
        const chatIds = await this.client.sMembers(Database.CHATS_KEY);
        return chatIds.map(id => +id);
    }

    public async pushChat(chatId: number): Promise<void> {
        await this.client.sAdd(Database.CHATS_KEY, String(chatId));
    }

    public async removeChat(chatId: number): Promise<void> {
        await this.client.sRem(Database.CHATS_KEY, String(chatId));
    }

    public async resetChats(): Promise<void> {
        await this.client.del(Database.CHATS_KEY);
    }

    public async importChats(chats: number[], overwrite = false): Promise<void> {
        if (overwrite) {
            await this.resetChats();
        } else {
            for (const chatId of chats) {
                await this.pushChat(chatId);
            }
        }
    }

    public async close(): Promise<void> {
        await this.client.quit();
    }
}
