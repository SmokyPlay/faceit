import { ButtonInteraction } from "discord.js";

import AbstractInteraction from "@/abstractions/AbstractInteraction";
import InteractionConfig from "@/types/InteractionConfig";
import InteractionExecutionResultConfig from "@/types/InteractionExecutionResultConfig";
import ReplaceType from "@/types/utils/ReplaceType";
import LeaderboardInteractionData from "@/types/InteractionsData/LeaderboardInteractionData";
import User from "@/types/database/User";

export default class LeaderboardInteraction extends AbstractInteraction implements InteractionConfig {
    public declare data: LeaderboardInteractionData

    public constructor(options: ReplaceType<InteractionConfig, 'data', LeaderboardInteractionData>) {
        super(options);
    }

    private async forward(interaction: ButtonInteraction): Promise<InteractionExecutionResultConfig> {
        this.data.page++;
        if(this.data.page <= 0) this.data.page = 1;
        let users = await global.mongo.find<User>('users');
        let pages = 3;
        if(this.data.page > pages) this.data.page = pages;
        users.sort((a, b) => b.elo - a.elo);
        users = users.slice((this.data.page-1)*10, this.data.page*10);
        this.reply.embed.description = "";
        users.forEach((user, i) => {
            this.reply.embed.description += `**${(this.data.page-1)*10 + (i+1)}.** <@${user.id}> • ${user.elo} ELO\n`;
        })
        this.reply.embed.footer = {text: `Страница ${this.data.page}/${pages}`};
        this.reply.row.components.find(c => c.customId.includes("backward")).setDisabled(this.data.page === 1)
        this.reply.row.components.find(c => c.customId.includes("forward")).setDisabled(this.data.page === pages)
        await interaction.editReply({embeds: [this.reply.embed], components: [this.reply.row]})
        return {ended: false}
    }

    private async backward(interaction: ButtonInteraction): Promise<InteractionExecutionResultConfig> {
        this.data.page--;
        if(this.data.page <= 0) this.data.page = 1;
        let users = await global.mongo.find<User>('users');
        let pages = 3;
        if(this.data.page > pages) this.data.page = pages;
        users.sort((a, b) => b.elo - a.elo);
        users = users.slice((this.data.page-1)*10, this.data.page*10);
        this.reply.embed.description = "";
        users.forEach((user, i) => {
            this.reply.embed.description += `**${(this.data.page-1)*10 + (i+1)}.** <@${user.id}> • ${user.elo} ELO\n`;
        })
        this.reply.embed.footer = {text: `Страница ${this.data.page}/${pages}`};
        this.reply.row.components.find(c => c.customId.includes("backward")).setDisabled(this.data.page === 1)
        this.reply.row.components.find(c => c.customId.includes("forward")).setDisabled(this.data.page === pages)
        await interaction.editReply({embeds: [this.reply.embed], components: [this.reply.row]})
        return {ended: false}
    }
}