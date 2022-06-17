import {MessageOptions, MessagePayload} from "discord.js";

export default interface PermanentInteractionConfig {
    channelId: string
    messageId?: string
}