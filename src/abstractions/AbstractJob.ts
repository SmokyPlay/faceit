import JobConfig from "@/types/JobConfig";

export default abstract class AbstractJob implements JobConfig {
    public static readonly scope = 'job';

    public abstract interval: number

    public abstract execute(): Promise<void>
}