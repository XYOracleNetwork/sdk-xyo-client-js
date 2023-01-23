import { EventListener } from './EventListener'

export interface ModuleEventEmitter<TEvent extends string, TEventArgs> {
  on(event: TEvent, handler: EventListener<TEventArgs>): this
}
