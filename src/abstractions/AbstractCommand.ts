import Discord from "discord.js";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";

export default abstract class AbstractCommand implements Discord.ChatInputApplicationCommandData {
  public static readonly scope = 'command';

  public abstract name: string
  public abstract description: string
  public abstract options?: Array<Discord.ApplicationCommandOptionData>
  public defaultPermission: boolean = true

  public abstract execute(interaction: Discord.Interaction): Promise<CommandExecutionResultConfig>
}