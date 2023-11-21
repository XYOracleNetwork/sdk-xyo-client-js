import { Module } from '@xyo-network/module-model'

import { BaseArguments } from '../../BaseArguments'
import { getModuleFromModuleFilter } from './getModuleFromModuleFilter'

export const getModuleByAddress = (args: BaseArguments, address: string): Promise<Module> => getModuleFromModuleFilter(args, { address: [address] })
