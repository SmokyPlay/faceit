import 'module-alias/register';

import dotenv from 'dotenv';
dotenv.config();

import BrawlStars from '@/structures/BrawlStars'
import Client from "@/structures/Client";
import Qiwi from "@qiwi/bill-payments-node-js-sdk";
global.qiwi = new Qiwi(process.env.QIWI_PRIVATE);

const client = new Client(process.env.TOKEN, {
  intents: ['GUILDS',
    'GUILD_MEMBERS',
    'GUILD_BANS',
    'GUILD_EMOJIS_AND_STICKERS',
    'GUILD_INTEGRATIONS',
    'GUILD_WEBHOOKS',
    'GUILD_INVITES',
    'GUILD_VOICE_STATES',
    'GUILD_PRESENCES',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_MESSAGE_TYPING',
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
    'DIRECT_MESSAGE_TYPING',
    'GUILD_SCHEDULED_EVENTS']
})

process.on('unhandledRejection', reason => {
  console.log(reason);
})

process.on('uncaughtException', err => {
  console.log(err);
})

const brawl = new BrawlStars(process.env.BS_TOKEN);
global.brawl = brawl;

client.start();