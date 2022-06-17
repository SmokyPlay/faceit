import Discord from "discord.js";
import BrawlStars from "@/structures/BrawlStars";

import Client from '@/structures/Client'
import MongoDB from "@/structures/MongoDB";

declare global {
  namespace NodeJS {
    interface Global {
      Discord: Discord
      brawl: BrawlStars
      client: Client
      mongo: MongoDB
    }

    interface ProcessEnv {
      TOKEN: string
      BS_TOKEN: string
      DB_URL: string
      DB_NAME: string
      HOST: string
      PORT: number
    }
  }
}