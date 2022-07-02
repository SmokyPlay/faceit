import Discord, { ClientOptions, Collection }  from 'discord.js';

import ClientCacheConfig from "@/types/ClientCacheConfig";
import AbstractCommand from "@/abstractions/AbstractCommand";
import ClientLoader from "@/utils/ClientLoader";
import AbstractInteraction from "@/abstractions/AbstractInteraction";
import MongoDB from "@/structures/MongoDB";
import AbstractPermanentInteraction from "@/abstractions/AbstractPermanentInteraction";

export default class Client extends Discord.Client {
  public readonly guildID: string = '955066806773616660';

  public cache: ClientCacheConfig = {
    commands: new Collection<string, AbstractCommand>(),
    interactions: new Collection<string, AbstractInteraction>(),
    permanentInteractions: new Collection<string, AbstractPermanentInteraction>()
  }

  constructor(token: string, options?: ClientOptions) {
    super(options);
    this.token = token;
    global.client = this;
  }

  load(): void {
    console.log(`[LOADERS] Loading modules...`)
    ClientLoader.loadEvents();
    ClientLoader.loadCommands();
    console.log(`[LOADERS] Loaded modules`)
  }

  activity(): Discord.ClientPresence {
    return this.user.setActivity({name: `в бабл квас`, type: 'PLAYING'});
  }

  async start(): Promise<any> {
    const mongo = new MongoDB()
    await mongo.start()
    console.log(`[MONGO] MongoDB connected!`)

    this.load()

    await this.login(this.token);
  }
}