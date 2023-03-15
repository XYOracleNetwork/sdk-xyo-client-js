import { Base } from '@xyo-network/core'
import { EventAnyListener, EventDataParams, EventFunctions, EventListener, Events } from '@xyo-network/module-events'

export class BaseEmitter<TParams extends EventDataParams = EventDataParams, TEventData extends TParams['eventData'] = TParams['eventData']>
  extends Base<TParams>
  implements EventFunctions<TEventData>
{
  private events: Events<TEventData>

  constructor(params: TParams) {
    super(params)
    this.events = new Events(params.eventData)
  }

  clearListeners(eventNames: keyof TEventData | (keyof TEventData)[]) {
    return this.events.clearListeners(eventNames)
  }

  emit(eventName: keyof TEventData, eventArgs?: TEventData[keyof TEventData]) {
    return this.events.emit(eventName, eventArgs)
  }

  emitSerial(eventName: keyof TEventData, eventArgs?: TEventData[keyof TEventData]) {
    return this.events.emitSerial(eventName, eventArgs)
  }

  listenerCount(eventNames: keyof TEventData | (keyof TEventData)[]) {
    return this.events.listenerCount(eventNames)
  }

  off<TEventName extends keyof TEventData, TEventArgs extends TEventData[TEventName]>(
    eventNames: TEventName | TEventName[],
    listener: EventListener<TEventArgs>,
  ) {
    return this.events.off(eventNames, listener as EventListener<TEventData[keyof TEventData]>)
  }

  offAny(listener: EventAnyListener<TEventData[keyof TEventData]>) {
    return this.events.offAny(listener)
  }

  on<TEventName extends keyof TEventData, TEventArgs extends TEventData[TEventName]>(
    eventNames: TEventName | TEventName[],
    listener: EventListener<TEventArgs>,
  ) {
    return this.events.on(eventNames, listener)
  }

  onAny(listener: EventAnyListener<TEventData>) {
    return this.events.onAny(listener)
  }

  once<TEventName extends keyof TEventData, TEventArgs extends TEventData[TEventName]>(eventNames: TEventName, listener: EventListener<TEventArgs>) {
    return this.events.once(eventNames, listener)
  }
}
