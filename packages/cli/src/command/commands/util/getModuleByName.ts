import { ModuleWrapper } from '@xyo-network/modules'

import { BaseArguments } from '../../BaseArguments'
import { getModuleFromModuleFilter } from './getModuleFromModuleFilter'

export const getModuleByName = (args: BaseArguments, name: string): Promise<ModuleWrapper> => getModuleFromModuleFilter(args, { name: [name] })
