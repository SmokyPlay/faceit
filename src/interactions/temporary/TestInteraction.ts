import Discord from "discord.js";

import AbstractInteraction from "@/abstractions/AbstractInteraction";
import InteractionConfig from "@/types/InteractionConfig";
import TestInteractionDataConfig from "@/types/InteractionsData/TestInteractionDataConfig";
import InteractionReplyConfig from "@/types/InteractionReplyConfig";
import User from "@/types/database/User";
import ReplaceType from "@/types/utils/ReplaceType";
import StartInteractionDataConfig from "@/types/InteractionsData/StartInteractionDataConfig";

export default class TestInteraction extends AbstractInteraction implements InteractionConfig {
    public declare data: TestInteractionDataConfig

    public constructor(options: ReplaceType<InteractionConfig, 'data', TestInteractionDataConfig>) {
        super(options);
    }

    private async plus(interaction: Discord.ButtonInteraction): Promise<boolean> {
        this.data.number++;
        await interaction.update({content: `Число ${this.data.number}`})
        return false;
    }

    private async minus(interaction: Discord.ButtonInteraction): Promise<boolean> {
        this.data.number--;
        await interaction.editReply({content: `Число ${this.data.number}`})
        return false;
    }

    private async stop(interaction: Discord.ButtonInteraction): Promise<boolean> {
        await interaction.editReply({components: []});
        return true;
    }
}