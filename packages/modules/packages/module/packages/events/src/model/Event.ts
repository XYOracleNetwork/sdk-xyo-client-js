import type { Promisable } from '@xylabs/promise'

export type EventName = PropertyKey
export type EventArgs = string | number | object
export type EventData = { [key: EventName]: EventArgs }
export type EventUnsubscribeFunction = () => void
export type EventAnyListener<TEventArgs extends EventArgs = EventArgs> = (eventName: EventName, eventData: TEventArgs) => Promisable<void>
export type EventListener<TEventArgs extends EventArgs = EventArgs> = (eventData: TEventArgs) => Promisable<void>

export interface EventFunctions<TEventData extends EventData> {
  eventData: TEventData
  clearListeners(eventNames: keyof TEventData | (keyof TEventData)[]): void
  emit<TEventName extends keyof TEventData>(eventName: TEventName, eventArgs: TEventData[TEventName]): Promise<void>
  emitSerial<TEventName extends keyof TEventData>(eventName: TEventName, eventArgs: TEventData[TEventName]): Promise<void>
  listenerCount(eventNames: keyof TEventData | (keyof TEventData)[]): number
  off<TEventName extends keyof TEventData>(eventNames: TEventName | TEventName[], listener: EventListener<TEventData[TEventName]>): void
  offAny(listener: EventAnyListener | Promise<void>): void
  on<TEventName extends keyof TEventData>(
    eventNames: TEventName | TEventName[],
    listener: EventListener<TEventData[TEventName]>,
  ): EventUnsubscribeFunction
  onAny(listener: EventAnyListener): EventUnsubscribeFunction
  once<TEventName extends keyof TEventData>(eventName: TEventName, listener: EventListener<TEventData[TEventName]>): EventUnsubscribeFunction
}
