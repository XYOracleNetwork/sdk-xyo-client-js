import { EventArgs } from './EventArgs'
import { EventListener } from './EventListener'

export interface ModuleEventEmitter<TEvent extends string, TEventArgs extends EventArgs = EventArgs> {
  on(event: TEvent, handler: EventListener<TEventArgs>): this
}
