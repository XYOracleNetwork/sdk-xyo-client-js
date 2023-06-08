import { ObjectWrapper } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'

export interface CreatableWrapper<T extends Payload, W extends ObjectWrapper<T>> {
  new (payload: T): W
  create(this: CreatableWrapper<T, W>, obj: T): W

  is(obj: unknown): boolean

  parse(this: CreatableWrapper<T, W>, obj?: unknown): W

  tryParse(this: CreatableWrapper<T, W>, obj?: unknown): W | undefined

  tryUnwrap(this: CreatableWrapper<T, W>, payload?: W | T): T | undefined

  tryUnwrapMany(this: CreatableWrapper<T, W>, payloads?: (W | T | undefined)[]): (T | undefined)[]

  unwrap(this: CreatableWrapper<T, W>, payload: W | T): T

  unwrapMany(this: CreatableWrapper<T, W>, payload: (W | T)[]): T[]

  wrap(this: CreatableWrapper<T, W>, payload: T | W): W

  wrapMany(this: CreatableWrapper<T, W>, payloads: (T | W)[]): W[]

  wrappedMap(this: CreatableWrapper<T, W>, payloads: (T | W)[]): Promise<Record<string, W>>
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function creatableWrapper<T extends Payload, W extends ObjectWrapper<T>>() {
  return <U extends CreatableWrapper<T, W>>(constructor: U) => {
    constructor
  }
}
