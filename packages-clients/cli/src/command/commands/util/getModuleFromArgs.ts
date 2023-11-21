import { asModuleInstance, ModuleInstance } from '@xyo-network/module-model'

import { printError } from '../../../lib'
import { getBridge } from '../../util'
import { ModuleArguments } from '../ModuleArguments'
import { getModuleFilterFromArgs } from './getModuleFilterFromArgs'

export const getModuleFromArgs = async (args: ModuleArguments): Promise<ModuleInstance> => {
  const { verbose } = args
  try {
    const bridge = await getBridge(args)
    const filter = getModuleFilterFromArgs(args)
    const resolved = await bridge.resolve(filter)
    return asModuleInstance(resolved.pop(), `Failed to load module from filter [${filter}]`)
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to connect to XYO Node')
  }
}
