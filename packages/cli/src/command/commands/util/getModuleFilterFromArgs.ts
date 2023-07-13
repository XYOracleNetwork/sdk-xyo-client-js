import { AnyModuleFilter, ModuleFilter } from '@xyo-network/module-model'

import { ModuleArguments } from '../ModuleArguments'

export const getModuleFilterFromArgs = (args: ModuleArguments): ModuleFilter => {
  const filter: AnyModuleFilter = {}
  if (args.address) filter.address = [args.address]
  if (args.name) filter.name = [args.name]
  return filter as ModuleFilter
}
