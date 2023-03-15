import { BaseParams } from '@xyo-network/core'
import { Promisable } from '@xyo-network/promise'

export type EventName = PropertyKey
export type EventArgs = string | number | object
export type EventData = { [key: EventName]: EventArgs }
export type EventUnsubscribeFunction = () => void
export type EventAnyListener<TEventArgs extends EventArgs = EventArgs> = (eventName: EventName, eventData?: TEventArgs) => Promisable<void>
export type EventListener<TEventArgs extends EventArgs = EventArgs> = (eventData?: TEventArgs) => Promisable<void>

export type OncePromise<T> = {
  off(): void
} & Promise<T>

export interface EventFunctions<TEventData extends EventData> {
  clearListeners(eventNames: keyof TEventData | (keyof TEventData)[]): void
  emit(eventName: keyof TEventData, eventData: TEventData[keyof TEventData]): Promise<void>
  emitSerial(eventName: keyof TEventData, eventData: TEventData[keyof TEventData]): Promise<void>
  listenerCount(eventNames: keyof TEventData | (keyof TEventData)[]): number
  off<TEventName extends keyof TEventData>(eventNames: TEventName | TEventName[], listener: EventListener): void
  offAny(listener: EventAnyListener<TEventData[keyof TEventData]> | Promise<void>): void
  on<TEventName extends keyof TEventData>(
    eventNames: TEventName | TEventName[],
    listener: EventListener<TEventData[TEventName]>,
  ): EventUnsubscribeFunction
  onAny(listener: EventAnyListener<TEventData[keyof TEventData]>): EventUnsubscribeFunction
  once<TEventName extends keyof TEventData>(eventName: TEventName, listener: EventListener<TEventData[TEventName]>): EventUnsubscribeFunction
}

export type EventDataParams<TEventData extends EventData | undefined = undefined, TParams extends BaseParams = BaseParams> = TParams & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventData?: TEventData extends EventData ? TEventData | any : any
}
