import Discord from "discord.js";

import AbstractCommand from "@/abstractions/AbstractCommand";
import AbstractInteraction from "@/abstractions/AbstractInteraction";
import AbstractPermanentInteraction from "@/abstractions/AbstractPermanentInteraction";

export default interface ClientCacheConfig {
  commands: Discord.Collection<string, AbstractCommand>
  interactions: Discord.Collection<string, AbstractInteraction>
  permanentInteractions: Discord.Collection<string, AbstractPermanentInteraction>
}