import Discord from "discord.js";

import AbstractEvent from "@/abstractions/AbstractEvent";
import EventConfig from "@/types/EventConfig";
import CommandsHandler from "@/services/CommandsHandler";
import InteractionsHandler from "@/services/InteractionsHandler";

export default class ReadyEvent extends AbstractEvent implements EventConfig {
  public name = 'interactionCreate'

  public async execute(interaction: Discord.Interaction) {
    if(interaction.isCommand()) {
      let handler = new CommandsHandler(interaction);
      return handler.handle()
    }
    else {
      let handler = new InteractionsHandler(interaction);
      return handler.handle()
    }
  }
}