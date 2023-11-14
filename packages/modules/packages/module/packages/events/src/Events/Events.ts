import { assertEx } from '@xylabs/assert'
import { handleError } from '@xylabs/error'
import { forget } from '@xylabs/forget'
import { Base, BaseParams } from '@xyo-network/core'

import { EventAnyListener, EventArgs, EventData, EventFunctions, EventListener, EventName } from '../model'

/**
Emittery can collect and log debug information.

To enable this feature set the `DEBUG` environment variable to `emittery` or `*`. Additionally, you can set the static `isDebugEnabled` variable to true on the Emittery class, or `myEmitter.debug.enabled` on an instance of it for debugging a single instance.

See API for more information on how debugging works.
*/
export type DebugLogger = (type: string, debugName: string, eventName?: EventName, eventData?: EventArgs) => void

export type EventListenerInfo<TEventArgs extends EventArgs = EventArgs> = {
  filter?: TEventArgs
  listener: EventListener<TEventArgs>
}

/**
Configure debug options of an instance.
*/
export type DebugOptions = {
  enabled?: boolean
  logger?: DebugLogger
  readonly name: string
}

const resolvedPromise = Promise.resolve()

export type MetaEventData<TEventData extends EventData> = {
  listenerAdded: {
    eventName?: keyof TEventData
    listener: EventListener<TEventData[keyof TEventData]> | EventAnyListener<TEventData[keyof TEventData]>
  }
  listenerRemoved: {
    eventName?: keyof TEventData
    listener: EventListener<TEventData[keyof TEventData]> | EventAnyListener<TEventData[keyof TEventData]>
  }
}

const isMetaEvent = (eventName: EventName) => eventName === 'listenerAdded' || eventName === 'listenerRemoved'

export type EventsParams = BaseParams<{ readonly debug?: DebugOptions }>

export class Events<TEventData extends EventData = EventData> extends Base<EventsParams> implements EventFunctions<TEventData> {
  protected static anyMap = new WeakMap<object, Set<EventAnyListener>>()
  protected static eventsMap = new WeakMap<object, Map<EventName, Set<EventListenerInfo>>>()

  private static canEmitMetaEvents = false
  private static isGlobalDebugEnabled = false

  //this is here to be able to query the type, not use
  eventData = {} as TEventData

  constructor(params: EventsParams = {}) {
    const mutatedParams = { ...params }
    if (mutatedParams.debug) {
      mutatedParams.debug.logger =
        mutatedParams.debug.logger ??
        ((type: string, debugName: string, eventName?: EventName, eventData?: EventArgs) => {
          let eventDataString: string
          let eventNameString: string | undefined
          try {
            eventDataString = JSON.stringify(eventData)
          } catch {
            eventDataString = `Object with the following keys failed to stringify: ${Object.keys(eventData ?? {}).join(',')}`
          }

          if (typeof eventName === 'symbol' || typeof eventName === 'number') {
            eventNameString = eventName.toString()
          } else {
            eventNameString = eventName
          }

          const currentTime = new Date()
          const logTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}.${currentTime.getMilliseconds()}`
          this.logger.log(`[${logTime}][events:${type}][${debugName}] Event Name: ${eventNameString}\n\tdata: ${eventDataString}`)
        })
    }
    super(mutatedParams)
    Events.anyMap.set(this, new Set<EventAnyListener>())
    Events.eventsMap.set(this, new Map<keyof TEventData, Set<EventListenerInfo>>())
  }

  static get isDebugEnabled() {
    // In a browser environment, `globalThis.process` can potentially reference a DOM Element with a `#process` ID,
    // so instead of just type checking `globalThis.process`, we need to make sure that `globalThis.process.env` exists.

    if (typeof globalThis.process?.env !== 'object') {
      return Events.isGlobalDebugEnabled
    }

    const { env } = globalThis.process ?? { env: {} }
    return env.DEBUG === 'events' || env.DEBUG === '*' || Events.isGlobalDebugEnabled
  }

  static set isDebugEnabled(newValue) {
    Events.isGlobalDebugEnabled = newValue
  }

  get debug() {
    return this.params.debug
  }

  clearListeners(eventNames: keyof TEventData | (keyof TEventData)[]) {
    const eventNamesArray = Array.isArray(eventNames) ? eventNames : [eventNames]

    for (const eventName of eventNamesArray) {
      this.logIfDebugEnabled('clear', eventName, undefined)

      if (typeof eventName === 'string' || typeof eventName === 'symbol' || typeof eventName === 'number') {
        const set = this.getListeners(eventName)
        if (set) {
          set.clear()
        }
      } else {
        Events.anyMap.get(this)?.clear()

        for (const [eventName, listeners] of assertEx(Events.eventsMap.get(this)).entries()) {
          listeners.clear()
          Events.eventsMap.get(this)?.delete(eventName)
        }
      }
    }
  }

  async emit<TEventName extends keyof TEventData>(eventName: TEventName, eventArgs: TEventData[TEventName]) {
    await this.emitInternal(eventName, eventArgs)
  }

  async emitMetaEvent<TEventName extends keyof MetaEventData<TEventData>>(eventName: TEventName, eventArgs: MetaEventData<TEventData>[TEventName]) {
    if (isMetaEvent(eventName)) {
      try {
        Events.canEmitMetaEvents = true
        await this.emitMetaEventInternal(eventName, eventArgs)
      } finally {
        Events.canEmitMetaEvents = false
      }
    }
  }

  async emitSerial<TEventName extends keyof TEventData>(eventName: TEventName, eventArgs: TEventData[TEventName]) {
    if (isMetaEvent(eventName) && !Events.canEmitMetaEvents) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`')
    }

    const filterMatch = (args: TEventData[TEventName], filter: TEventData[TEventName]) => {
      if (filter) {
        switch (typeof filter) {
          case 'object':
            return Object.entries(args).reduce((prev, [key, value]) => ((filter as Record<PropertyKey, unknown>)[key] === value ? true : prev), false)
          default:
            return args === filter
        }
      }
      return true
    }

    this.logIfDebugEnabled('emitSerial', eventName, eventArgs)

    const listeners = this.getListeners(eventName) ?? new Set()
    const filteredListeners = [...listeners.values()]
      .filter((value) => (value.filter ? filterMatch(eventArgs, value.filter as TEventData[TEventName]) : true))
      .map((info) => info.listener)
    const anyListeners = assertEx(Events.anyMap.get(this))
    const staticListeners = [...filteredListeners]
    const staticAnyListeners = [...anyListeners]

    await resolvedPromise

    for (const listener of staticListeners) {
      await this.safeCallListener(eventName, eventArgs, listener)
    }

    for (const listener of staticAnyListeners) {
      await this.safeCallAnyListener(eventName, eventArgs, listener)
    }
  }

  //TODO: Make test for this
  listenerCount(eventNames?: keyof TEventData | (keyof TEventData)[]) {
    const eventNamesArray = Array.isArray(eventNames) ? eventNames : [eventNames]
    let count = 0

    for (const eventName of eventNamesArray) {
      if (typeof eventName === 'string') {
        count += assertEx(Events.anyMap.get(this)).size + (this.getListeners(eventName)?.size ?? 0)

        continue
      }

      count += assertEx(Events.anyMap.get(this)).size

      for (const value of assertEx(Events.eventsMap.get(this)).values()) {
        count += value.size
      }
    }

    return count
  }

  logIfDebugEnabled<TEventName extends EventName>(type: string, eventName?: TEventName, eventArgs?: EventArgs) {
    if (Events.isDebugEnabled || this.debug?.enabled) {
      this.debug?.logger?.(type, this.debug.name, eventName, eventArgs)
    }
  }

  off<TEventName extends keyof TEventData, TEventListener = EventListener<TEventData[TEventName]>>(
    eventNames: TEventName | TEventName[],
    listener: TEventListener,
  ) {
    const eventNamesArray = Array.isArray(eventNames) ? eventNames : [eventNames]
    for (const eventName of eventNamesArray) {
      const set = this.getListeners(eventName) as Set<TEventListener>
      if (set) {
        set.delete(listener)
        if (set.size === 0) {
          const events = Events.eventsMap.get(this)
          events?.delete(eventName)
        }
      }

      this.logIfDebugEnabled('unsubscribe', eventName, undefined)

      if (!isMetaEvent(eventName)) {
        forget(this.emitMetaEvent('listenerRemoved', { eventName, listener: listener as EventListener }))
      }
    }
  }

  offAny(listener: EventAnyListener) {
    this.logIfDebugEnabled('unsubscribeAny', undefined, undefined)

    const typedMap = Events.anyMap.get(this) as Set<EventAnyListener<TEventData[keyof TEventData]>>
    typedMap?.delete(listener)
    forget(this.emitMetaEvent('listenerRemoved', { listener: listener as EventAnyListener }))
  }

  on<TEventName extends keyof TEventData = keyof TEventData>(
    eventNames: TEventName | TEventName[],
    listener: EventListener<TEventData[TEventName]>,
    filter?: TEventData[TEventName],
  ) {
    const eventNamesArray = Array.isArray(eventNames) ? eventNames : [eventNames]
    for (const eventName of eventNamesArray) {
      let set = this.getListeners(eventName)
      if (!set) {
        set = new Set()
        const events = Events.eventsMap.get(this)
        events?.set(eventName, set)
      }

      set.add({ filter, listener: listener as EventListener })

      this.logIfDebugEnabled('subscribe', eventName, undefined)

      if (!isMetaEvent(eventName)) {
        forget(this.emitMetaEvent('listenerAdded', { eventName, listener: listener as EventListener }))
      }
    }

    return this.off.bind(this, eventNames, listener as EventListener)
  }

  onAny(listener: EventAnyListener) {
    this.logIfDebugEnabled('subscribeAny', undefined, undefined)

    Events.anyMap.get(this)?.add(listener as EventAnyListener)
    forget(this.emitMetaEvent('listenerAdded', { listener: listener as EventAnyListener }))
    return this.offAny.bind(this, listener as EventAnyListener)
  }

  once<TEventName extends keyof TEventData>(eventName: TEventName, listener: EventListener<TEventData[TEventName]>) {
    const subListener = async (args: TEventData[TEventName]) => {
      this.off(eventName, subListener)
      await this.safeCallListener(eventName, args, listener)
    }
    this.on(eventName, subListener)
    return this.off.bind(this, eventName, subListener as EventListener)
  }

  private async emitInternal<TEventName extends keyof TEventData, TEventArgs extends TEventData[TEventName]>(
    eventName: TEventName,
    eventArgs: TEventArgs,
    filter?: TEventArgs,
  ) {
    if (isMetaEvent(eventName) && !Events.canEmitMetaEvents) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`')
    }

    this.logIfDebugEnabled('emit', eventName, eventArgs)

    const listeners = this.getListeners(eventName) ?? new Set()
    const filteredListeners = [...listeners.values()].filter((value) => (filter ? value.listener : true)).map((info) => info.listener)
    const anyListeners = assertEx(Events.anyMap.get(this))
    const staticListeners = [...filteredListeners]
    const staticAnyListeners = isMetaEvent(eventName) ? [] : [...anyListeners]

    await resolvedPromise
    await Promise.all([
      ...staticListeners.map(async (listener) => {
        await this.safeCallListener(eventName, eventArgs, listener)
      }),
      ...staticAnyListeners.map(async (listener) => {
        if (anyListeners.has(listener)) {
          await this.safeCallAnyListener(eventName, eventArgs, listener)
        }
      }),
    ])
  }

  private async emitMetaEventInternal<TEventName extends keyof MetaEventData<TEventData>>(
    eventName: TEventName,
    eventArgs: MetaEventData<TEventData>[TEventName],
  ) {
    if (isMetaEvent(eventName) && !Events.canEmitMetaEvents) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`')
    }

    this.logIfDebugEnabled('emit', eventName, eventArgs)

    const listeners = this.getListeners(eventName) ?? new Set()
    const filteredListeners = [...listeners.values()].map((info) => info.listener)
    const anyListeners = assertEx(Events.anyMap.get(this))
    const staticListeners = [...filteredListeners]
    const staticAnyListeners = isMetaEvent(eventName) ? [] : [...anyListeners]

    await resolvedPromise
    await Promise.all([
      ...staticListeners.map(async (listener) => {
        await this.safeCallListener(eventName, eventArgs, listener)
      }),
      ...staticAnyListeners.map(async (listener) => {
        if (anyListeners.has(listener)) {
          await this.safeCallAnyListener(eventName, eventArgs, listener)
        }
      }),
    ])
  }

  private getListeners<TEventName extends keyof TEventData>(eventName: TEventName) {
    const events = assertEx(Events.eventsMap.get(this))
    if (!events.has(eventName)) {
      return
    }

    return events.get(eventName)
  }

  private async safeCallAnyListener<TEventData extends EventData, TEventName extends keyof EventData>(
    eventName: TEventName,
    eventArgs: TEventData[TEventName],
    listener: EventAnyListener<TEventData[TEventName]>,
  ) {
    try {
      return await listener(eventName, eventArgs)
    } catch (ex) {
      handleError(ex, (error) => {
        this.logger?.error(`Listener[${String(eventName)}] Excepted: ${error.message}`)
      })
    }
  }

  private async safeCallListener<TEventData extends EventData, TEventName extends keyof EventData>(
    eventName: TEventName,
    eventArgs: TEventData[TEventName],
    listener: EventListener<TEventData[TEventName]>,
  ) {
    try {
      return await listener(eventArgs)
    } catch (ex) {
      handleError(ex, (error) => {
        this.logger?.error(`Listener[${String(eventName)}] Excepted: ${error.message}`)
      })
    }
  }
}
