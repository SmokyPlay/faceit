import AbstractPermanentInteraction from "@/abstractions/AbstractPermanentInteraction";
import PermanentInteractionConfig from "@/types/PermanentInteractionConfig";
import Discord, {
    MessagePayload,
    MessageOptions,
    MessageEmbed,
    MessageActionRow,
    SelectMenuInteraction,
    MessageButton, Modal, TextInputComponent, ModalSubmitInteraction, ButtonInteraction
} from "discord.js";
import PermanentInteractionExecutionResultConfig from "@/types/PermanentInteractionExecutionResultConfig";
import User from "@/types/database/User";

export default class BillingInteraction extends AbstractPermanentInteraction implements PermanentInteractionConfig {
    public channelId = "1009541691084120104"
    public messageId? = "1009778945761234974"

    public message(): MessagePayload | MessageOptions {
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setTitle("Пополнить счёт")
            .setDescription(`Чтобы пополнить свой баланс\n`
                + `1. Нажмите ${'`'}Пополнить${'`'}\n`
                + `2. Введите сумму, которую вы хотите положить на баланс\n`
                + `3. Оплатите счет, перейдя по выданной вам ссылке\n`
                + `4. Нажмите ${'`'}Проверить${'`'}`)
        let replenishmentButton = new MessageButton()
            .setCustomId("replenishment")
            .setStyle("PRIMARY")
            .setLabel("Пополнить")
        let checkButton = new MessageButton()
            .setCustomId("check")
            .setStyle("SECONDARY")
            .setLabel("Проверить")
        let row = new MessageActionRow()
            .addComponents(replenishmentButton, checkButton)
        return {embeds: [embed], components: [row]};
    }

    private async replenishment(interaction: ButtonInteraction): Promise<PermanentInteractionExecutionResultConfig> {
        let user = await global.mongo.findOne<User>('users', {id: interaction.user.id});
        if(!user) return {reply: {content: "Вы не зарегистрированы в системе", ephemeral: true}}
        let amountInput = new TextInputComponent()
            .setCustomId("amount")
            .setLabel("Количество денег")
            .setRequired(true)
            .setStyle("SHORT")
        let row = new MessageActionRow<TextInputComponent>().addComponents(amountInput);
        let modal = new Modal()
            .setCustomId(`${interaction.id}-replenishment`)
            .setTitle("Пополнить")
            .addComponents(row)
        await interaction.showModal(modal);
        let filter = (inter) => inter.customId === `${interaction.id}-replenishment`;
        interaction.awaitModalSubmit({filter, time: 120000})
            .then(modalInteraction => this.modalReplenishment(modalInteraction))
        return;
    }

    private async modalReplenishment(interaction: ModalSubmitInteraction): Promise<void> {
        let amount = Number(interaction.fields.getTextInputValue("amount"));
        if(isNaN(amount) || amount % 1 || amount < 1 || amount > 10000)
            return interaction.reply({content: "Неверно указано количество денег", ephemeral: true});
        let billId = global.qiwi.generateId();
        let ends = new Date(Date.now() + 2592000000)
        let fields = {
            amount: amount,
            currency: "RUB",
            comment: "Пополнение счета на CIS Faceit",
            account: interaction.user.id,
            expirationDateTime: ends
        }
        let response = await global.qiwi.createBill(billId, fields);
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setAuthor({name: "Счет создан", iconURL: interaction.user.displayAvatarURL()})
            .setDescription(`Чтобы оплатить его, перейдите по [этой ссылке](${response.payUrl})`)
        global.client.cache.bills.set(interaction.user.id, billId);
        return interaction.reply({embeds: [embed], ephemeral: true})
    }

    private async check(interaction: ButtonInteraction): Promise<void> {
        let bill = global.client.cache.bills.get(interaction.user.id);
        if(!bill) return interaction.reply({content: `Вы не создали счёт`, ephemeral: true});
        let response = await global.qiwi.getBillInfo(bill).catch(() => undefined);
        if(response?.status?.value !== "PAID") return interaction.reply({content: `Счёт не оплачен`, ephemeral: true});
        global.client.cache.bills.delete(interaction.user.id);
        let user = await global.mongo.findOne<User>('users', {id: interaction.user.id})
        if(!user.balance) user.balance = 0;
        let amount = Number(response.amount.value);
        user.balance += amount;
        await global.mongo.save('users', user);
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setAuthor({name: "Счет оплачен", iconURL: interaction.user.displayAvatarURL()})
            .setDescription(`На ваш баланс зачислено ${amount}₽`)
        return interaction.reply({embeds: [embed]});
    }
}