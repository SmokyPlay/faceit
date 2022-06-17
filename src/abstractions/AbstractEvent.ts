import EventConfig from "@/types/EventConfig";

export default abstract class AbstractEvent implements EventConfig {
  public static readonly scope = 'event';

  public abstract name: string

  public abstract execute(...params: any): Promise<any>
}