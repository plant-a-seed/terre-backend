import { Telegraf } from 'telegraf';
import { Logger } from 'euberlog';

import options from '@options';
import { Database } from '@bot/utils/database.js';

const logger = new Logger({
    scope: 'BOT - telegraf',
    debug: options.debugLog
});

export class Bot {
    private readonly bot: Telegraf;
    private readonly database: Database;

    constructor(botToken: string, database: Database) {
        this.database = database;
        this.bot = new Telegraf(botToken);
        this.init();
    }

    private init(): void {
        const welcomeText = `Welcome, I am Terrebot, the bot that will notify you if one of the beds of PaS needs water!`;
        const commandsText = `
Commands:
● <b>/start</b> will register you to the notifications
● <b>/stop</b> will unregister you from the notifications
● <b>/version</b> will show you the bot version
● <b>/help</b> will show you this message again
        `;

        const helpText = `${welcomeText}
        
${commandsText}`;
        const startText = `${welcomeText}

You have just been registered to the newsletter.

${commandsText}`;

        this.bot.start(async ctx => {
            logger.debug('Start command', ctx.chat);
            await this.database.pushChat(ctx.chat.id);
            return ctx.reply(startText, { parse_mode: 'HTML' });
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
        this.bot.help(async ctx => {
            logger.debug('Help command', ctx.chat);
            return ctx.reply(helpText, { parse_mode: 'HTML' });
        });
        void this.bot.launch();
    }

    private async sendMessageToChat(message: string, chatId: number): Promise<void> {
        try {
            await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
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

    public close(): void {
        this.bot.stop();
    }
}
