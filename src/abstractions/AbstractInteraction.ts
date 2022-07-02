import { Interaction } from "discord.js";
import InteractionConfig from "@/types/InteractionConfig";
import InteractionExecutionResultConfig from "@/types/InteractionExecutionResultConfig";
import InteractionReplyConfig from "@/types/InteractionReplyConfig";

export default abstract class AbstractInteraction implements InteractionConfig {
    public static readonly scope = 'interaction';

    public id: string
    public allowedUsers: Array<string> | null
    public data: any
    public reply: InteractionReplyConfig
    public processing: boolean = false

    protected constructor(options: InteractionConfig) {
        Object.assign(this, options);
    }

    public async execute(interaction: Interaction, action: string): Promise<InteractionExecutionResultConfig> {
        return this[action](interaction);
    }
}