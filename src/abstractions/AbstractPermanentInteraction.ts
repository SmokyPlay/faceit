import {Interaction, MessageOptions, MessagePayload} from "discord.js";
import PermanentInteractionConfig from "@/types/PermanentInteractionConfig";
import PermanentInteractionExecutionResultConfig from "@/types/PermanentInteractionExecutionResultConfig";

export default abstract class AbstractPermanentInteraction implements PermanentInteractionConfig {
    public static readonly scope = 'permanentInteraction'

    public abstract channelId: string
    public abstract messageId?: string

    public abstract message(): MessagePayload | MessageOptions

    public async execute(interaction: Interaction, action: string): Promise<PermanentInteractionExecutionResultConfig> {
        return this[action](interaction);
    }
}