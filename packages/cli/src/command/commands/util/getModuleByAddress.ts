import { ModuleWrapper } from '@xyo-network/modules'

import { BaseArguments } from '../../BaseArguments'
import { getModuleFromModuleFilter } from './getModuleFromModuleFilter'

export const getModuleByAddress = (args: BaseArguments, address: string): Promise<ModuleWrapper> =>
  getModuleFromModuleFilter(args, { address: [address] })
