import AbstractInteraction from "@/abstractions/AbstractInteraction";
import Discord from "discord.js";

export default interface PermanentInteractionExecutionResultConfig {
    reply: string | Discord.InteractionReplyOptions | Discord.ReplyMessageOptions
    interaction?: AbstractInteraction
}