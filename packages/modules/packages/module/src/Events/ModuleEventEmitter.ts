export type ListenerFunction<T> = (args: T) => void

export interface ModuleEventEmitter<TEvent extends string, TEventArgs> {
  on(event: TEvent, listener: ListenerFunction<TEventArgs>): this
}
