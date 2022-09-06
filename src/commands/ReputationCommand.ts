import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction,
    GuildMember,
    MessageEmbed
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import User from "@/types/database/User";
import Subscription from "@/types/database/Subscription";

export default class ReputationCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'репутация'
    public description = "Увеличивает или уменьшает репутацию указанного участника на единицу"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "USER",
            name: "участник",
            description: "Участник для оценки",
            required: true
        },
        {
            type: "STRING",
            name: "оценка",
            description: "Оценка участника",
            choices: [
                {name: "лайк", value: "like"},
                {name: "дизлайк", value: "dislike"}
            ],
            required: true
        },
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let user = await global.mongo.findOne<User>('users', {id: interaction.member.user.id});
        if(!user) return {reply: {content: "Вы не зарегистрированы в системе"}}
        let nextRep = user.lastRep?.getTime() + 86400000;
        if(nextRep > Date.now()) return {reply: {content: `Вы сможете ставить оценку <t:${Math.floor(nextRep/1000)}:R>`}}
        let member = interaction.options.getMember("участник") as GuildMember;
        let rate = interaction.options.getString("оценка") as string;
        if(!member) return {reply: {content: "Участник не найден"}}
        if(member.id === interaction.user.id) return {reply: {content: "Нельзя оценивать себя"}}
        let user2 = await global.mongo.findOne<User>('users', {id: member.id});
        if(!user2) return {reply: {content: "Участник не зарегистрирован в системе"}}
        if(!user2.rep) user2.rep = 0;
        let embed = new MessageEmbed()
            .setAuthor({name: member.user.tag, iconURL: member.displayAvatarURL()})
        switch (rate) {
            case "like":
                embed.setColor('#007ef8')
                    .setTitle("Лайк <:like:1016778645248946346>")
                embed.setAuthor({name: member.user.tag, iconURL: member.displayAvatarURL()})
                user2.rep++;
                break;
            case "dislike":
                embed.setColor('#ff0000')
                    .setTitle("Дизлайк <:dislike:1016778721820151828>")
                user2.rep--;
                break;
        }
        user.lastRep = new Date();
        embed.setDescription(`**Текущая репутация:** ${user2.rep}`)
        await global.mongo.save('users', user);
        await global.mongo.save('users', user2);
        return {reply: {embeds: [embed]}}
    }
}