import { asModule, Module, ModuleFilter } from '@xyo-network/module-model'

import { printError } from '../../../lib'
import { BaseArguments } from '../../BaseArguments'
import { getBridge } from '../../util'

export const getModuleFromModuleFilter = async (args: BaseArguments, filter: ModuleFilter): Promise<Module> => {
  const { verbose } = args
  try {
    const bridge = await getBridge(args)
    const resolved = await bridge.resolve(filter)
    return asModule(resolved.pop(), `Failed to load module from filter [${filter}]`)
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to connect to XYO Node')
  }
}
