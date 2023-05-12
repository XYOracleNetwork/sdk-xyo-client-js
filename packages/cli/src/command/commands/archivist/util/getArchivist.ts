import { ArchivistWrapper } from '@xyo-network/modules'

import { printError } from '../../../../lib'
import { BaseArguments } from '../../../BaseArguments'
import { isModuleArguments, ModuleArguments } from '../../ModuleArguments'
import { getModuleByName, getModuleFromArgs } from '../../util'

export const getArchivist = async (args: BaseArguments | ModuleArguments): Promise<ArchivistWrapper> => {
  const { verbose } = args
  try {
    const module = isModuleArguments(args) ? await getModuleFromArgs(args) : await getModuleByName(args, 'Archivist')
    const archivist = ArchivistWrapper.wrap(module)
    return archivist
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to obtain module for supplied address')
  }
}
