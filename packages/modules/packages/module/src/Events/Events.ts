import { forget } from '@xylabs/forget'
import { EventAnyListener, EventArgs, EventData, EventFunctions, EventListener, EventName } from '@xyo-network/module-model'

/**
Emittery can collect and log debug information.

To enable this feature set the `DEBUG` environment variable to `emittery` or `*`. Additionally, you can set the static `isDebugEnabled` variable to true on the Emittery class, or `myEmitter.debug.enabled` on an instance of it for debugging a single instance.

See API for more information on how debugging works.
*/
export type DebugLogger<TEventData extends EventData, TName extends keyof TEventData> = (
  type: string,
  debugName: string,
  eventName?: TName,
  eventData?: TEventData[TName],
) => void

/**
Configure debug options of an instance.
*/
export type DebugOptions<TEventData extends EventData> = {
  enabled?: boolean
  logger?: DebugLogger<TEventData, keyof TEventData>
  readonly name: string
}

/**
Configuration options for Emittery.
*/
export type Options<TEventData extends EventData> = {
  readonly debug?: DebugOptions<TEventData>
}

const anyProducer = Symbol('anyProducer')
const resolvedPromise = Promise.resolve()

const listenerAdded = 'listenerAdded'
const listenerRemoved = 'listenerRemoved'

export type MetaEventData<TEventData extends EventData> = {
  listenerAdded: { eventName?: keyof TEventData; listener: EventListener<TEventData> }
  listenerRemoved: { eventName?: keyof TEventData; listener: EventListener<TEventData> }
}

let canEmitMetaEvents = false
let isGlobalDebugEnabled = false

function assertEventName(eventName: EventName) {
  if (typeof eventName !== 'string' && typeof eventName !== 'symbol' && typeof eventName !== 'number') {
    throw new TypeError('`eventName` must be a string, symbol, or number')
  }
}

function assertListener(listener: object) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function')
  }
}

const isMetaEvent = (eventName: EventName) => eventName === listenerAdded || eventName === listenerRemoved

export class Events<TEventData extends EventData> implements EventFunctions<TEventData> {
  static anyMap = new WeakMap()
  static eventsMap = new WeakMap()
  static producersMap = new WeakMap()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug?: DebugOptions<any>

  constructor(options: Options<TEventData> = {}) {
    Events.anyMap.set(this, new Set())
    Events.eventsMap.set(this, new Map())
    Events.producersMap.set(this, new Map())

    Events.producersMap.get(this).set(anyProducer, new Set())

    this.debug = options.debug

    if (this.debug) {
      this.debug.enabled = !!this.debug.enabled

      this.debug.logger =
        this.debug.logger ??
        ((type: string, debugName: string, eventName?: keyof TEventData, eventData?: TEventData[keyof TEventData]) => {
          let eventDataString: string
          let eventNameString: string | undefined
          try {
            // TODO: Use https://github.com/sindresorhus/safe-stringify when the package is more mature. Just copy-paste the code.
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
          console.log(`[${logTime}][emittery:${type}][${debugName}] Event Name: ${eventNameString}\n\tdata: ${eventDataString}`)
        })
    }
  }

  static get isDebugEnabled() {
    // In a browser environment, `globalThis.process` can potentially reference a DOM Element with a `#process` ID,
    // so instead of just type checking `globalThis.process`, we need to make sure that `globalThis.process.env` exists.

    if (typeof globalThis.process?.env !== 'object') {
      return isGlobalDebugEnabled
    }

    const { env } = globalThis.process ?? { env: {} }
    return env.DEBUG === 'emittery' || env.DEBUG === '*' || isGlobalDebugEnabled
  }

  static set isDebugEnabled(newValue) {
    isGlobalDebugEnabled = newValue
  }

  clearListeners(eventNames: keyof TEventData | keyof TEventData[]) {
    const eventNamesArray = Array.isArray(eventNames) ? eventNames : [eventNames]

    for (const eventName of eventNamesArray) {
      this.logIfDebugEnabled('clear', eventName, undefined)

      if (typeof eventName === 'string' || typeof eventName === 'symbol' || typeof eventName === 'number') {
        const set = this.getListeners(eventName)
        if (set) {
          set.clear()
        }

        const producers = this.getEventProducers(eventName)
        if (producers) {
          for (const producer of producers) {
            producer.finish()
          }

          producers.clear()
        }
      } else {
        Events.anyMap.get(this).clear()

        for (const [eventName, listeners] of Events.eventsMap.get(this).entries()) {
          listeners.clear()
          Events.eventsMap.get(this).delete(eventName)
        }

        for (const [eventName, producers] of Events.producersMap.get(this).entries()) {
          for (const producer of producers) {
            producer.finish()
          }

          producers.clear()
          Events.producersMap.get(this).delete(eventName)
        }
      }
    }
  }

  async emit(eventName: keyof TEventData, eventData?: TEventData[keyof TEventData]) {
    await this.emitInternal(eventName, eventData)
  }

  async emitInternal<TEventName extends EventName, TEventArgs extends EventArgs>(eventName: TEventName, eventArgs?: TEventArgs) {
    assertEventName(eventName)

    if (isMetaEvent(eventName) && !canEmitMetaEvents) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`')
    }

    this.logIfDebugEnabled('emit', eventName, eventArgs)

    this.enqueueProducers(eventName, eventArgs)

    const listeners = this.getListeners(eventName) ?? new Set()
    const anyListeners = Events.anyMap.get(this)
    const staticListeners = [...listeners]
    const staticAnyListeners = isMetaEvent(eventName) ? [] : [...anyListeners]

    await resolvedPromise
    await Promise.all([
      ...staticListeners.map(async (listener) => {
        if (listeners.has(listener)) {
          return await listener(eventArgs)
        }
      }),
      ...staticAnyListeners.map(async (listener) => {
        if (anyListeners.has(listener)) {
          return await listener(eventName, eventArgs)
        }
      }),
    ])
  }

  async emitMetaEvent<TEventName extends EventName, TEventArgs extends EventArgs>(eventName: TEventName, eventArgs: TEventArgs) {
    if (isMetaEvent(eventName)) {
      try {
        canEmitMetaEvents = true
        await this.emitInternal(eventName, eventArgs)
      } finally {
        canEmitMetaEvents = false
      }
    }
  }

  async emitSerial(eventName: keyof TEventData, eventData: TEventData[keyof TEventData]) {
    assertEventName(eventName)

    if (isMetaEvent(eventName) && !canEmitMetaEvents) {
      throw new TypeError('`eventName` cannot be meta event `listenerAdded` or `listenerRemoved`')
    }

    this.logIfDebugEnabled('emitSerial', eventName, eventData)

    const listeners = this.getListeners(eventName) ?? new Set()
    const anyListeners = Events.anyMap.get(this)
    const staticListeners = [...listeners]
    const staticAnyListeners = [...anyListeners]

    await resolvedPromise

    for (const listener of staticListeners) {
      if (listeners.has(listener)) {
        await listener(eventData)
      }
    }

    for (const listener of staticAnyListeners) {
      if (anyListeners.has(listener)) {
        await listener(eventName, eventData)
      }
    }
  }

  getEventProducers(eventName?: keyof TEventData) {
    const key = typeof eventName === 'string' || typeof eventName === 'symbol' || typeof eventName === 'number' ? eventName : anyProducer
    const producers = Events.producersMap.get(this)
    if (!producers.has(key)) {
      return
    }

    return producers.get(key)
  }

  getListeners(eventName: keyof TEventData) {
    const events = Events.eventsMap.get(this)
    if (!events.has(eventName)) {
      return
    }

    return events.get(eventName)
  }

  listenerCount(eventNames: keyof TEventData | keyof TEventData[]) {
    const eventNamesArray = Array.isArray(eventNames) ? eventNames : [eventNames]
    let count = 0

    for (const eventName of eventNamesArray) {
      if (typeof eventName === 'string') {
        count +=
          Events.anyMap.get(this).size +
          (this.getListeners(eventName)?.size ?? 0) +
          (this.getEventProducers(eventName)?.size ?? 0) +
          (this.getEventProducers()?.size ?? 0)

        continue
      }

      if (typeof eventName !== 'undefined') {
        assertEventName(eventName)
      }

      count += Events.anyMap.get(this).size

      for (const value of Events.eventsMap.get(this).values()) {
        count += value.size
      }

      for (const value of Events.producersMap.get(this).values()) {
        count += value.size
      }
    }

    return count
  }

  logIfDebugEnabled<TEventName extends EventName, TEventArgs extends EventArgs>(type: string, eventName?: TEventName, eventArgs?: TEventArgs) {
    if (Events.isDebugEnabled || this.debug?.enabled) {
      this.debug?.logger?.(type, this.debug.name, eventName, eventArgs)
    }
  }

  off(eventNames: keyof TEventData | keyof TEventData[], listener: object) {
    assertListener(listener)

    const eventNamesArray = Array.isArray(eventNames) ? eventNames : [eventNames]
    for (const eventName of eventNamesArray) {
      assertEventName(eventName)
      const set = this.getListeners(eventName)
      if (set) {
        set.delete(listener)
        if (set.size === 0) {
          const events = Events.eventsMap.get(this)
          events.delete(eventName)
        }
      }

      this.logIfDebugEnabled('unsubscribe', eventName, undefined)

      if (!isMetaEvent(eventName)) {
        forget(this.emitMetaEvent(listenerRemoved, { eventName, listener }))
      }
    }
  }

  offAny(listener: object) {
    assertListener(listener)

    this.logIfDebugEnabled('unsubscribeAny', undefined, undefined)

    Events.anyMap.get(this).delete(listener)
    forget(this.emitMetaEvent(listenerRemoved, { listener }))
  }

  on(eventNames: keyof TEventData | keyof TEventData[], listener: object) {
    assertListener(listener)

    const eventNamesArray = Array.isArray(eventNames) ? eventNames : [eventNames]
    for (const eventName of eventNamesArray) {
      assertEventName(eventName)
      let set = this.getListeners(eventName)
      if (!set) {
        set = new Set()
        const events = Events.eventsMap.get(this)
        events.set(eventName, set)
      }

      set.add(listener)

      this.logIfDebugEnabled('subscribe', eventName, undefined)

      if (!isMetaEvent(eventName)) {
        forget(this.emitMetaEvent(listenerAdded, { eventName, listener }))
      }
    }

    return this.off.bind(this, eventNames, listener)
  }

  onAny(listener: EventAnyListener<TEventData>) {
    assertListener(listener)

    this.logIfDebugEnabled('subscribeAny', undefined, undefined)

    Events.anyMap.get(this).add(listener)
    forget(this.emitMetaEvent(listenerAdded, { listener }))
    return this.offAny.bind(this, listener)
  }

  once(eventNames: keyof TEventData | keyof TEventData[], listener: EventListener<TEventData>) {
    const subListener = async (args: TEventData[keyof TEventData]) => {
      this.off(eventNames, subListener)
      await listener(args)
    }
    this.on(eventNames, subListener)
    return this.off.bind(this, eventNames, subListener)
  }

  private enqueueProducers<TEventName extends EventName, TEventArgs extends EventArgs>(eventName: TEventName, eventData?: TEventArgs) {
    const producers = Events.producersMap.get(this)
    if (producers.has(eventName)) {
      for (const producer of producers.get(eventName)) {
        producer.enqueue(eventData)
      }
    }

    if (producers.has(anyProducer)) {
      const item = Promise.all([eventName, eventData])
      for (const producer of producers.get(anyProducer)) {
        producer.enqueue(item)
      }
    }
  }
}
