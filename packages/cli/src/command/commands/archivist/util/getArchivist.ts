import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { Module } from '@xyo-network/module-model'

import { printError } from '../../../../lib'
import { BaseArguments } from '../../../BaseArguments'
import { isModuleArguments, ModuleArguments } from '../../ModuleArguments'
import { getModuleByName, getModuleFromArgs } from '../../util'

export const getArchivist = async (args: BaseArguments | ModuleArguments): Promise<ArchivistInstance> => {
  const { verbose } = args
  try {
    const module: Module = isModuleArguments(args) ? await getModuleFromArgs(args) : await getModuleByName(args, 'Archivist')
    return asArchivistInstance(module, () => 'Failed to get Archivist')
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to obtain module for supplied address')
  }
}
