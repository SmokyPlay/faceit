import Discord from "discord.js";
import AbstractInteraction from "@/abstractions/AbstractInteraction";

export default interface CommandExecutionResultConfig {
    reply: string | Discord.InteractionReplyOptions | Discord.ReplyMessageOptions
    interaction?: AbstractInteraction
}