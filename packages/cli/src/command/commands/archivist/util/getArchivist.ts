import { ArchivistWrapper } from '@xyo-network/modules'

import { printError } from '../../../../lib'
import { ModuleArguments } from '../../ModuleArguments'
import { getModuleByAddress } from '../../util'

export const getArchivist = async (args: ModuleArguments): Promise<ArchivistWrapper> => {
  const { verbose } = args
  try {
    const module = await getModuleByAddress(args)
    const archivist = ArchivistWrapper.wrap(module)
    return archivist
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to obtain module for supplied address')
  }
}
