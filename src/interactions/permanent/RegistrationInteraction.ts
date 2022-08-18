import AbstractPermanentInteraction from "@/abstractions/AbstractPermanentInteraction";
import PermanentInteractionConfig from "@/types/PermanentInteractionConfig";
import {
    MessagePayload,
    MessageOptions,
    MessageEmbed,
    MessageActionRow,
    SelectMenuInteraction,
    MessageButton, Modal, TextInputComponent, ModalSubmitInteraction, ButtonInteraction
} from "discord.js";
import PermanentInteractionExecutionResultConfig from "@/types/PermanentInteractionExecutionResultConfig";
import User from "@/types/database/User";

export default class RegistrationInteraction extends AbstractPermanentInteraction implements PermanentInteractionConfig {
    public channelId = "992880007812743188"
    public messageId? = "992882901509226596"

    public message(): MessagePayload | MessageOptions {
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setTitle("Регистрация")
            .setDescription(`Для регистрации вашего Brawl Stars аккаунта\n`
            + `1. Нажмите ${'`'}Регистрация${'`'}\n`
            + `2. Введите ID вашего Brawl Stars аккаунта в модальном окне\n`
            + `3. Нажмите ${'`'}Отправить${'`'}`)
        let button = new MessageButton()
            .setCustomId("registration")
            .setStyle("PRIMARY")
            .setLabel("Регистрация")
        let row = new MessageActionRow()
            .addComponents(button)
        return {embeds: [embed], components: [row]};
    }

    private async registration(interaction: ButtonInteraction): Promise<PermanentInteractionExecutionResultConfig> {
        let user = await global.mongo.findOne<User>('users', {id: interaction.user.id});
        if(user) return {reply: {content: "Вы уже зарегистрированы в системе", ephemeral: true}}
        let accountIDInput = new TextInputComponent()
            .setCustomId("accountID")
            .setLabel("ID аккаунта")
            .setPlaceholder("#000000000")
            .setRequired(true)
            .setStyle("SHORT")
        let accountIDActionRow = new MessageActionRow<TextInputComponent>().addComponents(accountIDInput);
        let modal = new Modal()
            .setCustomId(`${interaction.id}-registration`)
            .setTitle("Регистрация")
            .addComponents(accountIDActionRow)
        await interaction.showModal(modal);
        let filter = (inter) => inter.customId === `${interaction.id}-registration`;
        interaction.awaitModalSubmit({filter, time: 120000})
            .then(modalInteraction => this.modalRegistration(modalInteraction))
        return;
    }

    private async modalRegistration(interaction: ModalSubmitInteraction): Promise<void> {
        let id = interaction.fields.getTextInputValue("accountID");
        id = id.toUpperCase();
        let account = await global.brawl.playerByTag(id).catch(() => undefined);
        let member = await interaction.guild.members.fetch(interaction.user.id);
        if(account) {
            let user = await global.mongo.findOne<User>('users', {brawlTag: account.tag});
            if(user) return interaction.reply({content: "Аккаунт с таким тегом уже зарегистрирован", ephemeral: true});
            await global.mongo.insert('users', {
                id: member.id,
                brawlTag: account.tag,
                elo: 100,
                battles: 0,
                victories: 0,
                defeats: 0,
                balance: 0
            })
            let ends = new Date(Date.now() + 2592000000)
            await global.mongo.insert('subscriptions', {
                id: member.id,
                started: new Date(),
                ends: ends
            })
            await member.setNickname(account.name + ' ' + account.tag).catch(() => {});
            await member.roles.remove("782544002544959518");
            setTimeout(() => member.roles.add("781200003586457610"), 3000);
            return interaction.reply({content: "Аккаунт зарегистрирован!", ephemeral: true})
        }
        return interaction.reply({content: "Аккаунт не найден", ephemeral: true})
    }
}