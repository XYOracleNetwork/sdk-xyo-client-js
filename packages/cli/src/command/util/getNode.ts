import { assertEx } from '@xylabs/assert'
import { HttpBridge } from '@xyo-network/http-bridge'
import { isNodeModule, NodeModule } from '@xyo-network/modules'

import { printError } from '../../lib'
import { BaseArguments } from '../BaseArguments'
import { getBridgeConfig } from './getBridgeConfig'

export const getNode = async (args: BaseArguments): Promise<NodeModule> => {
  const { verbose } = args
  try {
    const config = await getBridgeConfig(args)
    const bridge = await HttpBridge.create({ config })
    const node = assertEx((await bridge.downResolver.resolve<NodeModule>({ address: [bridge.rootAddress] }))?.pop(), 'Failed to resolve rootNode')
    assertEx(isNodeModule(node), 'Not a NodeModule')
    return node
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to connect to XYO Node')
  }
}
