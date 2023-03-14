import { Base } from '@xyo-network/core'
import { EventAnyListener, EventDataParams, EventFunctions, EventListener, Events } from '@xyo-network/module-events'

export class BaseEmitter<TParams extends EventDataParams = EventDataParams> extends Base<TParams> implements EventFunctions<TParams['eventData']> {
  private events: Events<TParams['eventData']>

  constructor(params: TParams) {
    super(params)
    this.events = new Events(params.eventData)
  }

  clearListeners(eventNames: keyof TParams['eventData'] | keyof TParams['eventData'][]) {
    return this.events.clearListeners(eventNames)
  }

  emit(eventName: keyof TParams['eventData'], eventArgs?: TParams['eventData'][keyof TParams['eventData']]) {
    return this.events.emit(eventName, eventArgs)
  }

  emitSerial(eventName: keyof TParams['eventData'], eventArgs?: TParams['eventData'][keyof TParams['eventData']]) {
    return this.events.emitSerial(eventName, eventArgs)
  }

  listenerCount(eventNames: keyof TParams['eventData'] | keyof TParams['eventData'][]) {
    return this.events.listenerCount(eventNames)
  }

  off(eventNames: keyof TParams['eventData'] | keyof TParams['eventData'][], listener: EventListener<TParams['eventData']>) {
    return this.events.off(eventNames, listener)
  }

  offAny(listener: EventAnyListener<TParams['eventData']>) {
    return this.events.offAny(listener)
  }

  on(eventNames: keyof TParams['eventData'] | keyof TParams['eventData'][], listener: EventListener<TParams['eventData']>) {
    return this.events.on(eventNames, listener)
  }

  onAny(listener: EventAnyListener<TParams['eventData']>) {
    return this.events.onAny(listener)
  }

  once(eventNames: keyof TParams['eventData'] | keyof TParams['eventData'][], listener: EventListener<TParams['eventData']>) {
    return this.events.once(eventNames, listener)
  }
}
