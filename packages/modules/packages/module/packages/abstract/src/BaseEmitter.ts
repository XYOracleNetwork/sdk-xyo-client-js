import { Base, BaseParams } from '@xyo-network/core'
import { EventAnyListener, EventData, EventFunctions, EventListener, Events } from '@xyo-network/module-events'

export class BaseEmitter<TParams extends BaseParams = BaseParams, TEventData extends EventData = EventData>
  extends Base<TParams>
  implements EventFunctions<TEventData>
{
  //just here to query types
  eventData = {} as TEventData

  private events: Events<TEventData>

  constructor(params: TParams) {
    super(params)
    this.events = new Events<TEventData>()
  }

  clearListeners(eventNames: keyof TEventData | (keyof TEventData)[]) {
    return this.events.clearListeners(eventNames)
  }

  emit<TEventName extends keyof TEventData = keyof TEventData, TEventArgs extends TEventData[TEventName] = TEventData[TEventName]>(
    eventName: TEventName,
    eventArgs: TEventArgs,
  ) {
    return this.events.emit(eventName, eventArgs)
  }

  emitSerial<TEventName extends keyof TEventData = keyof TEventData, TEventArgs extends TEventData[TEventName] = TEventData[TEventName]>(
    eventName: TEventName,
    eventArgs: TEventArgs,
  ) {
    return this.events.emitSerial(eventName, eventArgs)
  }

  listenerCount(eventNames: keyof TEventData | (keyof TEventData)[]) {
    return this.events.listenerCount(eventNames)
  }

  off<TEventName extends keyof TEventData>(eventNames: TEventName | TEventName[], listener: EventListener<TEventData[TEventName]>) {
    return this.events.off(eventNames, listener)
  }

  offAny(listener: EventAnyListener) {
    return this.events.offAny(listener)
  }

  on<TEventName extends keyof TEventData>(eventNames: TEventName | TEventName[], listener: EventListener<TEventData[TEventName]>) {
    return this.events.on(eventNames, listener)
  }

  onAny(listener: EventAnyListener) {
    return this.events.onAny(listener)
  }

  once<TEventName extends keyof TEventData>(eventName: TEventName, listener: EventListener<TEventData[TEventName]>) {
    return this.events.once(eventName, listener)
  }
}
