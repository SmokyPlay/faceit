type ReplaceType<T, K extends keyof T, X> = Omit<T, K> & { [P in K]: X }
export default ReplaceType;