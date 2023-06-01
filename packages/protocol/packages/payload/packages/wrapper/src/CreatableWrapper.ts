import { Payload } from '@xyo-network/payload-model'

import { Wrapper } from './Wrapper'

export interface CreatableWrapper<T extends Payload = Payload, W extends Wrapper<T> = Wrapper<T>> {
  new (payload: W['obj']): W
  create<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, obj?: W['obj']): W

  is(obj: unknown): boolean

  parse<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, obj?: unknown): W

  tryParse<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, obj?: unknown): W | undefined

  tryUnwrap<T extends Payload, W extends Wrapper<T>>(payload?: W['obj'] | W): W['obj'] | undefined
  tryUnwrapMany<T extends Payload, W extends Wrapper<T>>(payload?: (W['obj'] | W | undefined)[]): (W['obj'] | undefined)[]

  unwrap<T extends Payload, W extends Wrapper<T>>(payload: W['obj'] | W): W['obj']

  unwrapMany<T extends Payload, W extends Wrapper<T>>(payload: (W['obj'] | W)[]): W['obj'][]

  wrap<T extends Payload, W extends Wrapper<T>>(payload: W['obj'] | W): W
  wrapMany<T extends Payload, W extends Wrapper<T>>(payloads: (W['obj'] | W)[]): W[]

  wrappedMap<T extends Payload, W extends Wrapper<T>>(payloads: (W['obj'] | W)[]): Promise<Record<string, W>>
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
