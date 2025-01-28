import { assertEx } from '@xylabs/assert'
import type { Address } from '@xylabs/hex'
import type { BaseParams } from '@xylabs/object'
import { Base, toJsonString } from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import type {
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleResolverInstance,
  ObjectFilterOptions,
} from '@xyo-network/module-model'
import {
  asModuleInstance,
  ObjectResolverPriority,
} from '@xyo-network/module-model'

export interface ModuleResolverParams extends BaseParams {
  priority?: ObjectResolverPriority
  root: ModuleInstance
}

export abstract class AbstractModuleResolver<TParams extends ModuleResolverParams = ModuleResolverParams>
  extends Base<TParams>
  implements ModuleResolverInstance {
  get priority() {
    return this.params.priority ?? ObjectResolverPriority.Normal
  }

  set priority(value: ObjectResolverPriority) {
    this.params.priority = value
  }

  get root() {
    return assertEx(this.params.root, () => 'root is not set')
  }

  async resolve<T extends ModuleInstance = ModuleInstance>(): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier = '*',
    options?: ModuleFilterOptions<T>,
  ): Promise<T[] | T | undefined> {
    if (id === '*') {
      const values = await this.resolveHandler(id, options)
      assertEx(Array.isArray(values), () => 'resolveHandler returned a non-array')
      return values.map(value =>
        asModuleInstance<T>(value, () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return `resolveHandler returned invalid result (*) [${(value as any)?.constructor?.name}][${toJsonString(value)}]`
        }))
    }
    switch (typeof id) {
      case 'string': {
        const [value] = await this.resolveHandler(id, options)
        return asModuleInstance<T>(
          value,
          () =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `resolveHandler returned invalid result (string) [${(value as any)?.constructor?.name}][${toJsonString(value)}]`,
        )
      }
      default: {
        const values = (await this.resolveHandler(id, options)) as []
        assertEx(Array.isArray(values), () => 'resolveHandler returned a non-array')
        return values.map(value =>
          asModuleInstance<T>(value, () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return `resolveHandler returned invalid result (filter) [${(value as any)?.constructor?.name}][${toJsonString(value)}]`
          }))
      }
    }
  }

  async resolvePrivate<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ObjectFilterOptions<T>): Promise<T[]>
  async resolvePrivate<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ObjectFilterOptions<T>): Promise<T | undefined>
  async resolvePrivate<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    _options?: ObjectFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    if (id === '*') return await Promise.resolve([])
  }

  abstract addResolver(resolver: ModuleResolverInstance): this
  abstract removeResolver(resolver: ModuleResolverInstance): this

  abstract resolveHandler<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promisable<T[]>

  abstract resolveIdentifier(id: ModuleIdentifier, options?: ObjectFilterOptions): Promisable<Address | undefined>
}
