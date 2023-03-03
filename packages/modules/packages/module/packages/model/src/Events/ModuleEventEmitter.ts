import { EventArgs } from './EventArgs'
import { EventListener } from './EventListener'

export type EventEmitterFunc<TResult, TEvent extends string = never, TEventArgs extends EventArgs = EventArgs> = (
  event: TEvent,
  handler: EventListener<TEventArgs>,
) => TResult

export interface ModuleEventEmitter<TEvent extends string = never, TEventArgs extends EventArgs = EventArgs> {
  on: EventEmitterFunc<this, TEvent, TEventArgs>
}
