import AbstractInteraction from "@/abstractions/AbstractInteraction";
import Discord from "discord.js";

export default interface PermanentInteractionExecutionResultConfig {
    reply?: Discord.InteractionReplyOptions
    interaction?: AbstractInteraction
}