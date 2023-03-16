import { Promisable } from '@xyo-network/promise'

export type EventName = PropertyKey
export type EventArgs = string | number | object
export type EventData = { [key: EventName]: EventArgs }
export type EventUnsubscribeFunction = () => void
export type EventAnyListener<TEventArgs extends EventArgs = EventArgs> = (eventName: EventName, eventData: TEventArgs) => Promisable<void>
export type EventListener<TEventArgs extends EventArgs = EventArgs> = (eventData: TEventArgs) => Promisable<void>

export type OncePromise<T> = {
  off(): void
} & Promise<T>

export interface EventFunctions<TEventData extends EventData> {
  clearListeners(eventNames: keyof TEventData | (keyof TEventData)[]): void
  emit<TEventName extends keyof TEventData = keyof TEventData, TEventArgs extends TEventData[TEventName] = TEventData[TEventName]>(
    eventName: TEventName,
    eventArgs: TEventArgs,
  ): Promise<void>
  emitSerial<TEventName extends keyof TEventData = keyof TEventData, TEventArgs extends TEventData[TEventName] = TEventData[TEventName]>(
    eventName: TEventName,
    eventArgs: TEventArgs,
  ): Promise<void>
  listenerCount(eventNames: keyof TEventData | (keyof TEventData)[]): number
  off<TEventName extends keyof TEventData = keyof TEventData, TEventArgs extends TEventData[TEventName] = TEventData[TEventName]>(
    eventNames: TEventName | TEventName[],
    listener: EventListener<TEventArgs>,
  ): void
  offAny<TEventArgs extends TEventData[keyof TEventData] = TEventData[keyof TEventData]>(listener: EventAnyListener<TEventArgs> | Promise<void>): void
  on<TEventName extends keyof TEventData, TEventArgs extends TEventData[TEventName] = TEventData[TEventName]>(
    eventNames: TEventName | TEventName[],
    listener: EventListener<TEventArgs>,
  ): EventUnsubscribeFunction
  onAny<TEventArgs extends TEventData[keyof TEventData] = TEventData[keyof TEventData]>(
    listener: EventAnyListener<TEventArgs>,
  ): EventUnsubscribeFunction
  once<TEventName extends keyof TEventData = keyof TEventData, TEventArgs extends TEventData[TEventName] = TEventData[TEventName]>(
    eventName: TEventName,
    listener: EventListener<TEventArgs>,
  ): EventUnsubscribeFunction
}
