import { Collection } from "discord.js";

import AbstractCommand from "@/abstractions/AbstractCommand";
import AbstractInteraction from "@/abstractions/AbstractInteraction";
import AbstractPermanentInteraction from "@/abstractions/AbstractPermanentInteraction";

export default interface ClientCacheConfig {
  commands: Collection<string, AbstractCommand>
  interactions: Collection<string, AbstractInteraction>
  permanentInteractions: Collection<string, AbstractPermanentInteraction>,
  bills: Collection<string, string>
}