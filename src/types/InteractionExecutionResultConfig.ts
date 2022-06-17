import AbstractInteraction from "@/abstractions/AbstractInteraction";

export default interface InteractionExecutionResultConfig {
    ended: boolean
    interaction?: AbstractInteraction
}