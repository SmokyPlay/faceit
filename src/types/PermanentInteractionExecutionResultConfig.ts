import AbstractInteraction from "@/abstractions/AbstractInteraction";
import { InteractionReplyOptions } from "discord.js";

export default interface PermanentInteractionExecutionResultConfig {
    reply?: InteractionReplyOptions
    interaction?: AbstractInteraction
}