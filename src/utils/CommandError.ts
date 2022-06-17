import Discord from "discord.js";

export default class CommandError {
    public static noVoiceChannel(member: Discord.GuildMember): Discord.MessageEmbed {
        return new Discord.MessageEmbed()
            .setColor('#ff0000')
            .setAuthor({name: "Ошибка", iconURL: member.displayAvatarURL({dynamic: true})})
            .setDescription("Эту команду можно использовать только находясь в лобби");
    }
    public static other(member: Discord.GuildMember, text: string, name: string = "Ошибка"): Discord.MessageEmbed {
        return new Discord.MessageEmbed()
            .setColor('#ff0000')
            .setAuthor({name: name, iconURL: member.displayAvatarURL({dynamic: true})})
            .setDescription(text);
    }
}