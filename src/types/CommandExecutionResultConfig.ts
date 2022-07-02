import { InteractionReplyOptions, ReplyMessageOptions } from "discord.js";
import AbstractInteraction from "@/abstractions/AbstractInteraction";

export default interface CommandExecutionResultConfig {
    reply: string | InteractionReplyOptions | ReplyMessageOptions
    interaction?: AbstractInteraction
}