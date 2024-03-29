import AbstractEvent from "@/abstractions/AbstractEvent";
import EventConfig from "@/types/EventConfig";
import ClientLoader from "@/utils/ClientLoader";

export default class ReadyEvent extends AbstractEvent implements EventConfig {
  public name = 'ready'

  public async execute(): Promise<any> {
    console.log(`[CLIENT] Bot ${global.client.user?.tag} is online`);
    global.client.activity();
    await ClientLoader.slashCommands();
    await ClientLoader.engageJobs();
    await ClientLoader.loadPermanentInteractions();
    //global.brawl.battleLog("#9Y9U8GJVQ").then(l => console.log(l.items[0].battle))
  }
}