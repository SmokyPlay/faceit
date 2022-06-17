import 'module-alias/register';

import dotenv from 'dotenv';
dotenv.config();

import BrawlStars from '@/structures/BrawlStars'
import Client from "@/structures/Client";

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

const brawl = new BrawlStars(process.env.BS_TOKEN);
global.brawl = brawl;

client.start();