import { HttpBridge } from '@xyo-network/http-bridge'
import { asModule, Module } from '@xyo-network/module-model'

import { printError } from '../../../lib'
import { getBridgeConfig } from '../../util'
import { ModuleArguments } from '../ModuleArguments'
import { getModuleFilterFromArgs } from './getModuleFilterFromArgs'

export const getModuleFromArgs = async (args: ModuleArguments): Promise<Module> => {
  const { verbose } = args
  try {
    const config = await getBridgeConfig(args)
    const bridge = await HttpBridge.create({ config })
    const filter = getModuleFilterFromArgs(args)
    const resolved = await bridge.downResolver.resolve(filter)
    return asModule(resolved.pop(), `Failed to load module from filter [${filter}]`)
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to connect to XYO Node')
  }
}
