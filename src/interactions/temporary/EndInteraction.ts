import Discord from "discord.js";

import AbstractInteraction from "@/abstractions/AbstractInteraction";
import InteractionConfig from "@/types/InteractionConfig";
import EndInteractionDataConfig from "@/types/InteractionsData/EndInteractionDataConfig";
import InteractionExecutionResultConfig from "@/types/InteractionExecutionResultConfig";
import ReplaceType from "@/types/utils/ReplaceType";
import User from "@/types/database/User";
import BattleResults from "@/utils/BattleResults";
import CommandError from "@/utils/CommandError";

export default class EndInteraction extends AbstractInteraction implements InteractionConfig {
    public declare data: EndInteractionDataConfig

    public constructor(options: ReplaceType<InteractionConfig, 'data', EndInteractionDataConfig>) {
        super(options);
    }

    private async end(interaction: Discord.SelectMenuInteraction): Promise<InteractionExecutionResultConfig> {
        let member = interaction.member as Discord.GuildMember;
        for(let i in this.data.team1) {
            let m = this.data.team1[i];
            m.brawl = await global.mongo.findOne<User>('users', {id: m.discord.id});
            this.data.team1[i] = m;
        }
        for(let i in this.data.team2) {
            let m = this.data.team2[i];
            m.brawl = await global.mongo.findOne<User>('users', {id: m.discord.id});
            this.data.team2[i] = m;
        }
        let logs = await global.brawl.battleLog(this.data.team1.find(m => m.captain).brawl.brawlTag);
        let log = logs.items[0].battle;
        let results = await BattleResults(this.data, log);
        if(!results) {
            this.reply.row.components[0].setDisabled(true);
            await interaction.editReply({components: [this.reply.row]})
            await interaction.followUp({embeds: [
                CommandError.other(member, "Бой еще не окончен, либо лобби было создано неправильно. Повторите попытку через 30 секунд")]
            })
            setTimeout(async () => {
                this.reply.row.components[0].setDisabled(false);
                await interaction.editReply({components: [this.reply.row]})
            }, 30000)
            return {ended: false}
        }
        this.reply.embed
            .setDescription(`Игра окончена!\nПобедила команда #${results.winner.replace('team', '')}`)
            .addField("Команда 1",
                this.data.team1.map(memb => memb.discord.toString()
                    + (results.members.find(m => m === memb).eloChange >= 0 ? '+' : '')
                    + `${results.members.find(m => m === memb).eloChange} ELO`)
                    .join("\n"), true)
            .addField("Команда 2",
                this.data.team2.map(memb => memb.discord.toString()
                    + (results.members.find(m => m === memb).eloChange >= 0 ? '+' : '')
                    + `${results.members.find(m => m === memb).eloChange} ELO`)
                    .join("\n"), true)
        await interaction.editReply({embeds: [this.reply.embed]})
        let resultsChannel = interaction.guild.channels.cache.get(this.data.lobby.results) as Discord.TextChannel
        await resultsChannel.send({embeds: [this.reply.embed]});
        return {ended: true}
    }
}