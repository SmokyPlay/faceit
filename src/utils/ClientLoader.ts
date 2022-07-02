import { TextChannel } from "discord.js";
import fs from "fs";

import AbstractEvent from "@/abstractions/AbstractEvent";
import AbstractCommand from "@/abstractions/AbstractCommand";
import AbstractJob from "@/abstractions/AbstractJob";
import AbstractPermanentInteraction from "@/abstractions/AbstractPermanentInteraction";

export default class ClientLoader {
  public static loadEvents(path: string = process.cwd() + "/dist/src/events"): void {
    fs.readdirSync(path).forEach(fileName => {
      let file:string = path +  '/' + fileName;
      if(fs.lstatSync(file).isDirectory()) this.loadEvents(file)
      else {
        if(!file.endsWith('.js')) return;
        delete require.cache[require.resolve(file)]
        let Event = require(file)?.default;
        if(Event?.scope === 'event') {
          let event: AbstractEvent = new Event();
          global.client.on(event.name, event.execute);
        }
      }
    })
  }

  public static loadCommands(path: string = process.cwd() + "/dist/src/commands"): void {
    fs.readdirSync(path).forEach(fileName => {
      let file:string = path +  '/' + fileName;
      if(fs.lstatSync(file).isDirectory()) this.loadCommands(file)
      else {
        if(!file.endsWith('.js')) return;
        delete require.cache[require.resolve(file)]
        let Command = require(file)?.default;
        if(Command?.scope === 'command') {
          let command: AbstractCommand = new Command();
          global.client.cache.commands.set(command.name, command);
        }
      }
    })
  }

  public static async loadPermanentInteractions(path: string = process.cwd() + "/dist/src/interactions/permanent"): Promise<void> {
    for(let fileName of fs.readdirSync(path)) {
      let file:string = path +  '/' + fileName;
      if(fs.lstatSync(file).isDirectory()) this.loadPermanentInteractions(file)
      else {
        if(!file.endsWith('.js')) return;
        delete require.cache[require.resolve(file)]
        let PermanentInteraction = require(file)?.default;
        if(PermanentInteraction.scope === 'permanentInteraction') {
          let interaction: AbstractPermanentInteraction = new PermanentInteraction();
          let content = interaction.message();
          let channel = global.client.channels.cache.get(interaction.channelId) as TextChannel;
          if(!channel) return;
          let message = await channel.messages.fetch(interaction.messageId ?? '').catch(() => undefined);
          if(!message) {
            message = await channel.send(content);
            interaction.messageId = message.id;
          }
          else await message.edit(content);
          global.client.cache.permanentInteractions.set(message.id, interaction);
        }
      }
    }
  }

  public static engageJobs(path: string = process.cwd() + "/dist/src/jobs"): void {
    fs.readdirSync(path).forEach(async fileName => {
      let file:string = path +  '/' + fileName;
      if(fs.lstatSync(file).isDirectory()) this.engageJobs(file)
      else {
        if(!file.endsWith('.js')) return;
        delete require.cache[require.resolve(file)]
        let Job = require(file)?.default;
        if(Job?.scope === 'job') {
          let job: AbstractJob = new Job();
          await job.execute()
          setInterval(job.execute, job.interval);
        }
      }
    })
  }

  public static async slashCommands(): Promise<void> {
    let commands = []
    global.client.cache.commands.forEach(cmd => {
      commands.push({
        name: cmd.name,
        description: cmd.description,
        type: 'CHAT_INPUT',
        options: cmd.options,
        defaultPermission: cmd.defaultPermission
      })
    })
    await global.client.guilds.cache.first().commands.set(commands)
  }
}