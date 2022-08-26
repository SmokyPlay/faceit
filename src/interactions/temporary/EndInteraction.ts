import {GuildMember, Message, SelectMenuInteraction, TextChannel} from "discord.js";

import AbstractInteraction from "@/abstractions/AbstractInteraction";
import InteractionConfig from "@/types/InteractionConfig";
import EndInteractionData from "@/types/InteractionsData/EndInteractionData";
import InteractionExecutionResultConfig from "@/types/InteractionExecutionResultConfig";
import ReplaceType from "@/types/utils/ReplaceType";
import BattleResults from "@/utils/BattleResults";
import CommandError from "@/utils/CommandError";
import BattleTimeParser from "@/utils/BattleTimeParser";
import {emit} from "cluster";

export default class EndInteraction extends AbstractInteraction implements InteractionConfig {
    public declare data: EndInteractionData

    public constructor(options: ReplaceType<InteractionConfig, 'data', EndInteractionData>) {
        super(options);
    }

    private async end(interaction: SelectMenuInteraction): Promise<InteractionExecutionResultConfig> {
        let member = interaction.member as GuildMember;
        let logs = await global.brawl.battleLog(this.data.team1.find(m => m.captain).brawl.brawlTag);
        let log = logs.items.filter(l => BattleTimeParser(l.battleTime) > this.data.startedAt).map(l => l.battle);
        log = log.items.filter(l => l.mode === this.data.modes[this.data.count.games].value)
        console.log("Game ended, logs length:", log.length);
        let winner = await BattleResults.GetWinner(this.data, log);
        this.data.count[winner.winner]++;
        this.data.count.games++;
        if(!winner) {
            await interaction.followUp({embeds: [
                CommandError.other(member, "Бой еще не окончен, либо лобби было создано неправильно")]
            })
            return {ended: false}
        }
        this.reply.embed.fields = []
        this.reply.embed
            .addField("Команда 1",
                this.data.team1.map(memb => memb.discord.toString() + (memb.captain ? '⭐' : ''))
                    .join("\n"), true)
            .addField("Команда 2" + `Счёт: ${this.data.count.team1}`,
                this.data.team2.map(memb => memb.discord.toString() + (memb.captain ? '⭐' : ''))
                    .join("\n") + `Счёт: ${this.data.count.team1}`, true)
        if(this.data.count.team1 === 2 || this.data.count.team2 === 2) {
            let winner: "team1" | "team2" = this.data.count.team1 === 2 ? "team1" : "team2"
            let results = await BattleResults.BattleResults(this.data, winner);
            this.reply.embed.fields = [];
            this.reply.embed
                .setThumbnail("https://media.discordapp.net/attachments/992896807199834153/992901019283488818/unknown.png")
                .setDescription(`Игра окончена!\nПобедила команда #${results.winner.replace('team', '')}`)
                .addField("Команда 1",
                    this.data.team1.map(memb =>
                        (results.members.find(m => m === memb).eloChange >= 0 ? '<:up:992903003264778353> ' : '<:down:992903114543869952> ')
                        + memb.discord.toString() + ' '
                        + (results.members.find(m => m === memb).eloChange >= 0 ? '+' : '')
                        + `${results.members.find(m => m === memb).eloChange} ELO`)
                        .join("\n"), true)
                .addField("Команда 2",
                    this.data.team2.map(memb =>
                        (results.members.find(m => m === memb).eloChange >= 0 ? '<:up:992903003264778353> ' : '<:down:992903114543869952> ')
                        + memb.discord.toString() + ' '
                        + (results.members.find(m => m === memb).eloChange >= 0 ? '+' : '')
                        + `${results.members.find(m => m === memb).eloChange} ELO`)
                        .join("\n"), true)
            let resultsChannel = interaction.guild.channels.cache.get(this.data.lobby.results) as TextChannel
            await resultsChannel.send({embeds: [this.reply.embed]});
            await interaction.editReply({embeds: [this.reply.embed], components: []})
            return {ended: true}
        }
        await interaction.editReply({embeds: [this.reply.embed]})
        return {ended: false}
    }
}