import { Base, BaseParams } from '@xyo-network/core'
import { EventAnyListener, EventData, EventFunctions, EventListener, Events } from '@xyo-network/module-events'

export class BaseEmitter<TParams extends BaseParams = BaseParams, TEventData extends EventData = EventData>
  extends Base<TParams>
  implements EventFunctions<TEventData>
{
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

  off<TEventName extends keyof TEventData = keyof TEventData, TEventArgs extends TEventData[TEventName] = TEventData[TEventName]>(
    eventNames: TEventName | TEventName[],
    listener: EventListener<TEventArgs>,
  ) {
    return this.events.off(eventNames, listener)
  }

  offAny<TEventArgs extends TEventData[keyof TEventData] = TEventData[keyof TEventData]>(listener: EventAnyListener<TEventArgs>) {
    return this.events.offAny(listener)
  }

  on<TEventName extends keyof TEventData = keyof TEventData, TEventArgs extends TEventData[TEventName] = TEventData[TEventName]>(
    eventNames: TEventName | TEventName[],
    listener: EventListener<TEventArgs>,
  ) {
    return this.events.on(eventNames, listener)
  }

  onAny<TEventArgs extends TEventData[keyof TEventData] = TEventData[keyof TEventData]>(listener: EventAnyListener<TEventArgs>) {
    return this.events.onAny(listener)
  }

  once<TEventName extends keyof TEventData = keyof TEventData, TEventArgs extends TEventData[TEventName] = TEventData[TEventName]>(
    eventName: TEventName,
    listener: EventListener<TEventArgs>,
  ) {
    return this.events.once(eventName, listener)
  }
}
