import { asDivinerModule, DivinerModule } from '@xyo-network/diviner-model'

import { printError } from '../../../../lib'
import { ModuleArguments } from '../../ModuleArguments'
import { getModuleFromArgs } from '../../util'

export const getDiviner = async (args: ModuleArguments): Promise<DivinerModule> => {
  const { verbose } = args
  try {
    return asDivinerModule(await getModuleFromArgs(args), 'Failed to get Diviner')
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to obtain module for supplied address')
  }
}
