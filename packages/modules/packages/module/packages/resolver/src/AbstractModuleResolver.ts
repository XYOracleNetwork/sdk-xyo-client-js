import { assertEx } from '@xylabs/assert'
import { Base, BaseParams, toJsonString } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
import { asModuleInstance, ModuleFilter, ModuleFilterOptions, ModuleIdentifier, ModuleInstance, ModuleResolver } from '@xyo-network/module-model'

export abstract class AbstractModuleResolver<T extends BaseParams = BaseParams> extends Base<T> implements ModuleResolver {
  async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(filter: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  /** @deprecated use '*' if trying to resolve all */
  async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | string = '*',
    options?: ModuleFilterOptions<T>,
  ): Promise<T[] | T | undefined> {
    if (idOrFilter === '*') {
      const values = (await this.resolveHandler(idOrFilter, options)) as []
      assertEx(Array.isArray(values), () => 'resolveHandler returned a non-array')
      return values.map((value) =>
        asModuleInstance<T>(value, () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return `resolveHandler returned invalid result (*) [${(value as any)?.constructor?.name}][${toJsonString(value)}]`
        }),
      )
    }
    switch (typeof idOrFilter) {
      case 'string': {
        const value = await this.resolveHandler(idOrFilter, options)
        return asModuleInstance<T>(
          value,
          () =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `resolveHandler returned invalid result (string) [${(value as any)?.constructor?.name}][${toJsonString(value)}]`,
        )
      }
      default: {
        const values = (await this.resolveHandler(idOrFilter, options)) as []
        assertEx(Array.isArray(values), () => 'resolveHandler returned a non-array')
        return values.map((value) =>
          asModuleInstance<T>(value, () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return `resolveHandler returned invalid result (filter) [${(value as any)?.constructor?.name}][${toJsonString(value)}]`
          }),
        )
      }
    }
  }

  abstract resolveHandler<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promisable<T | T[] | undefined>
}
