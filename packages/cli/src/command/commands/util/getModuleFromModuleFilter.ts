import { assertEx } from '@xylabs/assert'
import { HttpBridge } from '@xyo-network/http-bridge'
import { ModuleFilter, ModuleWrapper } from '@xyo-network/modules'

import { printError } from '../../../lib'
import { BaseArguments } from '../../BaseArguments'
import { getBridgeConfig } from '../../util'

export const getModuleFromModuleFilter = async (args: BaseArguments, filter: ModuleFilter): Promise<ModuleWrapper> => {
  const { verbose } = args
  try {
    const config = await getBridgeConfig(args)
    const bridge = await HttpBridge.create({ config })
    const resolved = await bridge.downResolver.resolve(filter)
    const mod = assertEx(resolved.pop(), `Failed to load module from filter [${filter}]`)
    return ModuleWrapper.wrap(mod)
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to connect to XYO Node')
  }
}
