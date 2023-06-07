import { Wrapper } from './Wrapper'

export interface CreatableWrapper<T extends Wrapper = Wrapper> {
  new (payload: T['obj']): T
  create(this: CreatableWrapper<T>, obj: T['obj']): T

  is(obj: unknown): boolean

  parse(this: CreatableWrapper<T>, obj?: unknown): T

  tryParse(this: CreatableWrapper<T>, obj?: unknown): T | undefined

  tryUnwrap(this: CreatableWrapper<T>, payload?: T['obj'] | T): T['obj'] | undefined

  tryUnwrapMany(this: CreatableWrapper<T>, payloads?: (T['obj'] | T | undefined)[]): (T['obj'] | undefined)[]

  unwrap(this: CreatableWrapper<T>, payload: T['obj'] | T): T['obj']

  unwrapMany(this: CreatableWrapper<T>, payload: (T['obj'] | T)[]): T['obj'][]

  wrap(this: CreatableWrapper<T>, payload: T | T['obj']): T

  wrapMany(this: CreatableWrapper<T>, payloads: (T | T['obj'])[]): T[]

  wrappedMap(this: CreatableWrapper<T>, payloads: (T | T['obj'])[]): Promise<Record<string, T>>
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function creatableWrapper<T extends Wrapper>() {
  return <U extends CreatableWrapper<T>>(constructor: U) => {
    constructor
  }
}
