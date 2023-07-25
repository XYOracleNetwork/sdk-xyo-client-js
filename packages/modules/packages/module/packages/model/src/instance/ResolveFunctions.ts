import { Promisable } from '@xyo-network/promise'

import { ModuleFilter, ModuleFilterOptions } from './ModuleFilter'
import { ModuleInstance } from './ModuleInstance'

export interface ResolveFunctions {
  resolve(filter?: ModuleFilter, options?: ModuleFilterOptions): Promisable<ModuleInstance[]>
  resolve(nameOrAddress: string, options?: ModuleFilterOptions): Promisable<ModuleInstance | undefined>
  resolve(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions<ModuleInstance>,
  ): Promisable<ModuleInstance | ModuleInstance[] | undefined>
}
