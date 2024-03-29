import { Bot } from 'grammy';
import { Logger } from 'euberlog';

import options from '@options';
import { Database } from '@bot/utils/database.js';

const logger = new Logger({
    scope: 'BOT - telegraf',
    debug: options.debugLog
});

export class TerreBot {
    private readonly bot: Bot;
    private readonly database: Database;

    constructor(botToken: string, database: Database) {
        this.database = database;
        this.bot = new Bot(botToken);
    }

    public async init(): Promise<void> {
        const welcomeText = `Welcome, I am Terrebot, the bot that will notify you if one of the beds of PaS needs water!`;
        const commandsText = `
Commands:
● <b>/start</b> will register you to the notifications
● <b>/stop</b> will unregister you from the notifications
● <b>/min [num]</b> will show you the min moisture or set it if you provide a number
● <b>/version</b> will show you the bot version
● <b>/help</b> will show you this message again

        `;

        const helpText = `${welcomeText}
        
${commandsText}`;
        const startText = `${welcomeText}

You have just been registered to the newsletter.

${commandsText}`;

        this.bot.command('start', async ctx => {
            logger.debug('Start command', ctx.chat);
            await this.database.pushChat(ctx.chat.id);
            return ctx.reply(startText, { parse_mode: 'HTML' });
        });
        this.bot.command('min', async ctx => {
            logger.debug('Min', ctx.chat);
            const match = /^\s*(-?\d+)\s*$/.exec(ctx.match);
            if (!match) {
                const min = await this.database.getMinMoisture();
                return ctx.reply(`The min moisture is ${min ?? 'not set'}`);
            } else {
                const min = +match[1];
                if (min < 0 || min > options.thresholds.maxPossibleMoisture)
                    return ctx.reply('The min moisture must be between 0 and 8000');
                await this.database.setMinMoisture(min);
                return ctx.reply(`The min moisture is now ${min}`);
            }
        });
        this.bot.command('stop', async ctx => {
            logger.debug('Stop command', ctx.chat);
            await this.database.removeChat(ctx.chat.id);
            return ctx.reply(
                'You have been deregistered. If you want to start receiving notifications again, use the <b>/start</b> command',
                { parse_mode: 'HTML' }
            );
        });
        this.bot.command('version', async ctx => {
            logger.debug('Version command', ctx.chat);
            return ctx.reply(`The version of this bot is <b>${options.version}</b>`, { parse_mode: 'HTML' });
        });
        this.bot.command('help', async ctx => {
            logger.debug('Help command', ctx.chat);
            return ctx.reply(helpText, { parse_mode: 'HTML' });
        });
        await this.bot.api.setMyCommands([
            { command: 'start', description: 'Register you to the notifications' },
            { command: 'stop', description: 'Unregister you from the notifications' },
            { command: 'min', description: 'Show you the min moisture or set it if you provide a number' },
            { command: 'version', description: 'Show you the bot version' },
            { command: 'help', description: 'Show you this message again' }
        ]);
        void this.bot.start({
            onStart(botInfo) {
                logger.info(`Bot started with info`, botInfo);
            }
        });
    }

    private async sendMessageToChat(message: string, chatId: number): Promise<void> {
        try {
            await this.bot.api.sendMessage(chatId, message, { parse_mode: 'HTML' });
        } catch (error) {
            logger.error(`Error sending message to chat ${chatId}`, error);
        }
    }

    private async sendMessageToEveryone(message: string): Promise<void> {
        const chattIds = await this.database.getChats();
        const tasks = chattIds.map(async chatId => this.sendMessageToChat(message, chatId));
        await Promise.all(tasks);
    }

    public async sendWateringNotification(bed: string, soilMoisture: number, needsWater: boolean): Promise<void> {
        const message = `The bed <b>${bed}</b> ${
            needsWater ? '<b>needs</b>' : 'does <b>not</b> need'
        } water. The soil moisture is <b>${soilMoisture}</b>`;
        await this.sendMessageToEveryone(message);
    }

    public async close(): Promise<void> {
        return await this.bot.stop();
    }
}
