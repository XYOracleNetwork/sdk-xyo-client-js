export interface Wrapper<T extends object = object> {
  obj: T
}

export interface CreatableWrapper<T extends object, W extends Wrapper<T>> {
  new (obj: T): W
  parse(this: CreatableWrapper<T, W>, obj?: unknown): W
  unwrap(this: CreatableWrapper<T, W>, obj?: T | W): T
  wrap(this: CreatableWrapper<T, W>, obj?: T | W): W
}

export type CreatableWrapperFactory<T extends object, W extends Wrapper<T>> = Omit<Omit<CreatableWrapper<T, W>, 'new'>, 'create'> & {
  create(this: CreatableWrapperFactory<T, W>, params?: T): Promise<W>
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function creatableWrapper<T extends object, W extends Wrapper<T> = Wrapper<T>>() {
  return <U extends CreatableWrapper<T, W>>(constructor: U) => {
    constructor
  }
}
