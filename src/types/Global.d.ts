import Qiwi from "@qiwi/bill-payments-node-js-sdk";
import BrawlStars from "@/structures/BrawlStars";

import Client from '@/structures/Client'
import MongoDB from "@/structures/MongoDB";

declare global {
  namespace NodeJS {
    interface Global {
      brawl: BrawlStars
      client: Client
      mongo: MongoDB
      qiwi: Qiwi
    }

    interface ProcessEnv {
      TOKEN: string
      BS_TOKEN: string
      DB_URL: string
      DB_NAME: string
      HOST: string
      PORT: number
      QIWI_PUBLIC: string
      QIWI_PRIVATE: string
    }
  }
}