import { GuildMember, MessageEmbed } from "discord.js";

export default class CommandError {
    public static other(member: GuildMember, text: string, name: string = "Ошибка"): MessageEmbed {
        return new MessageEmbed()
            .setColor('#ff0000')
            .setAuthor({name: name, iconURL: member.displayAvatarURL({dynamic: true})})
            .setDescription(text);
    }
}