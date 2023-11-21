export type ConfigurationFunction<T = void> = () => Promise<T> | T
