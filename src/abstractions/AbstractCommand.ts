import {
  ApplicationCommandOptionData,
  ChatInputApplicationCommandData,
  Interaction
} from "discord.js";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";

export default abstract class AbstractCommand implements ChatInputApplicationCommandData {
  public static readonly scope = 'command';

  public abstract name: string
  public abstract description: string
  public abstract options?: Array<ApplicationCommandOptionData>
  public defaultPermission: boolean = true

  public abstract execute(interaction: Interaction): Promise<CommandExecutionResultConfig>
}