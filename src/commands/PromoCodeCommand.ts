import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember, MessageEmbed
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import PromoCode from "@/types/database/PromoCode";
import User from "@/types/database/User";
import CommandError from "@/utils/CommandError";

export default class PromoCodeManagerCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'промокод'
    public description = 'Использует введенный промокод, чтобы перестать использовать, введите "-"'
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "STRING",
            name: "промокод",
            description: 'Промокод, который вы хотите использовать или "-"',
            required: true
        }
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let member = interaction.member as GuildMember;
        let code = interaction.options.getString("промокод");
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        if(!user) return {reply: {embeds: [CommandError.other(member, "Вы не зарегистрированы в системе")]}}
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setAuthor({name: "Промокод", iconURL: member.displayAvatarURL({dynamic: true})})
        if(code === "-") {
            user.promoCode = null;
            user.promoCodeStarted = null;
            await global.mongo.save('users', user);
            embed.setDescription("Вы больше не используете промокод")
            return {reply: {embeds: [embed]}}
        }
        let promoCode = await global.mongo.findOne<PromoCode>('promoCodes', {code: code});
        if(!promoCode) return {reply: {content: "Такого промокода не существует"}}
        user.promoCode = promoCode.code;
        user.promoCodeStarted = new Date();
        await global.mongo.save('users', user);
        embed.setDescription(`Вы используете промокод ${"`" + promoCode.code + "`"}`)
        return {reply: {embeds: [embed]}}
    }
}