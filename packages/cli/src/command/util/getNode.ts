import { assertEx } from '@xylabs/assert'
import { HttpBridge } from '@xyo-network/http-bridge'
import { NodeWrapper } from '@xyo-network/node'
import { DirectNodeModule, isNodeModule, NodeModule } from '@xyo-network/node-model'

import { printError } from '../../lib'
import { BaseArguments } from '../BaseArguments'
import { getBridgeConfig } from './getBridgeConfig'

export const getNode = async (args: BaseArguments): Promise<DirectNodeModule> => {
  const { verbose } = args
  try {
    const config = await getBridgeConfig(args)
    const bridge = await HttpBridge.create({ config })
    const node = assertEx(
      (await bridge.downResolver.resolve<NodeModule>({ address: [await bridge.getRootAddress()] }))?.pop(),
      'Failed to resolve rootNode',
    )
    assertEx(isNodeModule(node), 'Not a NodeModule')
    return NodeWrapper.wrap(node)
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to connect to XYO Node')
  }
}
