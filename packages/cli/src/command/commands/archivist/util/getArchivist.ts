import { ArchivistModule, asArchivistModule, Module } from '@xyo-network/modules'

import { printError } from '../../../../lib'
import { BaseArguments } from '../../../BaseArguments'
import { isModuleArguments, ModuleArguments } from '../../ModuleArguments'
import { getModuleByName, getModuleFromArgs } from '../../util'

export const getArchivist = async (args: BaseArguments | ModuleArguments): Promise<ArchivistModule> => {
  const { verbose } = args
  try {
    const module: Module = isModuleArguments(args) ? await getModuleFromArgs(args) : await getModuleByName(args, 'Archivist')
    return asArchivistModule(module, () => 'Failed to get Archivist')
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to obtain module for supplied address')
  }
}
