import { Module } from '@xyo-network/modules'

import { BaseArguments } from '../../BaseArguments'
import { getModuleFromModuleFilter } from './getModuleFromModuleFilter'

export const getModuleByName = (args: BaseArguments, name: string): Promise<Module> => getModuleFromModuleFilter(args, { name: [name] })
