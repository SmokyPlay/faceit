import {MessageActionRow, MessageEmbed} from "discord.js";
import InteractionReplyConfig from "@/types/InteractionReplyConfig";

export default interface InteractionConfig {
    id: string
    allowedUsers: Array<string> | null
    data: any
    reply?: InteractionReplyConfig
}