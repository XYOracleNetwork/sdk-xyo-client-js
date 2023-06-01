import { Payload } from '@xyo-network/payload-model'

import { Wrapper } from './Wrapper'

export interface CreatableWrapper<T extends Payload = Payload, W extends Wrapper<T> = Wrapper<T>> {
  new (payload: T): W
  create<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, obj?: W['obj']): W

  is(obj: unknown): boolean

  parse<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, obj?: unknown): W

  tryParse<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, obj?: unknown): W | undefined

  tryUnwrap<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, payload?: T | W): T | undefined
  tryUnwrapMany<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, payload?: (T | W | undefined)[]): (T | undefined)[]

  unwrap<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, payload: T | W): T

  unwrapMany<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, payload: (T | W)[]): T[]

  wrap<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, payload: T | W): W
  wrapMany<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, payloads: (T | W)[]): W[]

  wrappedMap<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, payloads: (T | W)[]): Promise<Record<string, W>>
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function creatableWrapper<T extends Payload, W extends Wrapper<T>>() {
  return <U extends CreatableWrapper<T, W>>(constructor: U) => {
    constructor
  }
}
