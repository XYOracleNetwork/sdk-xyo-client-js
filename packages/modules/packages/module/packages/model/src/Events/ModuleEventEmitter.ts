import { EventArgs } from './EventArgs'
import { EventListener } from './EventListener'

export interface ModuleEventEmitter<TEvent extends string = never, TEventArgs extends EventArgs = EventArgs> {
  on(event: TEvent, handler: EventListener<TEventArgs>): this
}
