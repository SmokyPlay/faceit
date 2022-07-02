import { MessageEmbed, MessageActionRow } from "discord.js";

export default interface InteractionReplyConfig {
    embed?: MessageEmbed
    row?: MessageActionRow
}