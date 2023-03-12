import { Promisable } from '@xyo-network/promise'

export type EventName = PropertyKey
export type EventArgs = string | number | object
export type EventData = { [key: EventName]: EventArgs }
export type EventUnsubscribeFunction = () => void
export type EventAnyListener<TEventData extends EventData> = (
  eventName: keyof TEventData,
  eventData?: TEventData[keyof TEventData],
) => Promisable<void>
export type EventListener<TEventData extends EventData> = (eventData?: TEventData[keyof TEventData]) => Promisable<void>

export type OncePromise<T> = {
  off(): void
} & Promise<T>

export interface EventFunctions<TEventData extends EventData> {
  clearListeners(eventNames: keyof TEventData | keyof TEventData[]): void
  emit(eventName: keyof TEventData, eventData: TEventData[keyof TEventData]): Promise<void>
  emitSerial(eventName: keyof TEventData, eventData: TEventData[keyof TEventData]): Promise<void>
  listenerCount(eventNames: keyof TEventData | keyof TEventData[]): number
  off(eventName: keyof TEventData | keyof TEventData[], listener: EventListener<TEventData>): void
  offAny(listener: EventAnyListener<TEventData> | Promise<void>): void
  on(eventName: keyof TEventData | keyof TEventData[], listener: EventListener<TEventData>): EventUnsubscribeFunction
  onAny(listener: EventAnyListener<TEventData>): EventUnsubscribeFunction
  once(eventName: keyof TEventData | keyof TEventData[], listener: EventListener<TEventData>): EventUnsubscribeFunction
}
