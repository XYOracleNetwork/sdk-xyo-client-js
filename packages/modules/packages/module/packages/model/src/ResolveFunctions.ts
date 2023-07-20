import { Promisable } from '@xyo-network/promise'

import { ModuleInstance } from './instance'
import { ModuleFilter, ModuleFilterOptions } from './ModuleFilter'

export interface ResolveFunctions {
  resolve<TModuleInstance extends ModuleInstance>(
    filter?: ModuleFilter,
    options?: ModuleFilterOptions<TModuleInstance>,
  ): Promisable<TModuleInstance[]>
  resolve<TModuleInstance extends ModuleInstance>(
    nameOrAddress: string,
    options?: ModuleFilterOptions<TModuleInstance>,
  ): Promisable<TModuleInstance | undefined>
  resolve<TModuleInstance extends ModuleInstance>(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions<TModuleInstance>,
  ): Promisable<TModuleInstance | TModuleInstance[] | undefined>
}
