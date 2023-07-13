import { HttpBridge } from '@xyo-network/http-bridge'
import { asModule, Module, ModuleFilter } from '@xyo-network/module-model'

import { printError } from '../../../lib'
import { BaseArguments } from '../../BaseArguments'
import { getBridgeConfig } from '../../util'

export const getModuleFromModuleFilter = async (args: BaseArguments, filter: ModuleFilter): Promise<Module> => {
  const { verbose } = args
  try {
    const config = await getBridgeConfig(args)
    const bridge = await HttpBridge.create({ config })
    const resolved = await bridge.downResolver.resolve(filter)
    return asModule(resolved.pop(), `Failed to load module from filter [${filter}]`)
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to connect to XYO Node')
  }
}
