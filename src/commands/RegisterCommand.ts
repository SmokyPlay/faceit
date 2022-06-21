import Discord from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import User from "@/types/database/User";

export default class RegisterCommand extends AbstractCommand implements Discord.ChatInputApplicationCommandData {
  public name = 'регистрация'
  public description = "Регистрирует ваш Brawl Stars аккаунт"
  public options: Array<Discord.ApplicationCommandOptionData> = [
    {
      type: "STRING",
      name: "id_аккаунта",
      description: "ID вашего аккаунта в Brawl Stars",
      required: true
    }
  ]

  public async execute(interaction: Discord.CommandInteraction): Promise<CommandExecutionResultConfig> {
    let id = interaction.options.get("id_аккаунта")?.value as string;
    id = id.toUpperCase();
    let account = await global.brawl.playerByTag(id).catch(() => undefined);
    let member = await interaction.guild.members.fetch(interaction.user.id);
    if(account) {
      let user = await global.mongo.findOne<User>('users', {brawlTag: account.tag});
      if(user) return {reply: {content: "Аккаунт с таким тегом уже зарегистрирован"}}
      await global.mongo.insert('users', {
        id: member.id,
        brawlTag: account.tag,
        elo: 100,
        battles: 0,
        victories: 0,
        defeats: 0,
        balance: 0
      })
      await member.setNickname(account.name + ' ' + account.tag).catch(() => {});
      await member.roles.remove("782544002544959518");
      setTimeout(() => member.roles.add("781200003586457610"), 3000);
      return {reply: {content: "Аккаунт зарегистрирован!"}}
    }
    else return {reply: {content: "Аккаунт не найден"}}
  }
}