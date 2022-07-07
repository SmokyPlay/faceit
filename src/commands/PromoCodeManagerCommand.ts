import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import PromoCode from "@/types/database/PromoCode";

export default class PromoCodeManagerCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'промокод-менеджер'
    public description = "Создает или удаляет промокод с указанным названием"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "STRING",
            name: "действие",
            description: "Действие с промокодом",
            choices: [
                {name: "создать", value: "create"},
                {name: "удалить", value: "delete"}
            ],
            required: true
        },
        {
            type: "STRING",
            name: "промокод",
            description: "Название промокода",
            required: true
        }
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let action = interaction.options.getString("действие");
        let code = interaction.options.getString("промокод");
        let promoCode = await global.mongo.findOne<PromoCode>('promoCodes', {code: code});
        let result;
        switch (action) {
            case 'create':
                if(promoCode) return {reply: {content: "Такой промокод уже существует"}}
                await global.mongo.insert('promoCodes', {
                    code: code,
                    balance: 0
                })
                result = {reply: {content: `Создан промокод ${"`" + code + "`"}`}}
                break;
            case 'delete':
                if(!promoCode) return {reply: {content: "Такого промокода не существует"}}
                await global.mongo.delete('promoCodes', {code: code});
                result = {reply: {content: `Промокод ${"`" + code + "`"} удален`}}
                break;
        }
        return result;
    }
}