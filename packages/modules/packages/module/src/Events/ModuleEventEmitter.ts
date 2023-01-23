import { EventListener } from './EventListener'

export interface ModuleEventEmitter<TEvent extends string, TEventArgs = undefined> {
  on(event: TEvent, handler: EventListener<TEventArgs>): this
}
