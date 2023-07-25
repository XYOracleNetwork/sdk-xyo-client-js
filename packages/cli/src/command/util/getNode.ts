import { assertEx } from '@xylabs/assert'
import { HttpBridge } from '@xyo-network/http-bridge'
import { asNodeInstance, NodeInstance } from '@xyo-network/node-model'

import { printError } from '../../lib'
import { BaseArguments } from '../BaseArguments'
import { getBridgeConfig } from './getBridgeConfig'

export const getNode = async (args: BaseArguments): Promise<NodeInstance> => {
  const { verbose } = args
  try {
    const config = await getBridgeConfig(args)
    const bridge = await HttpBridge.create({ config })
    const node = assertEx((await bridge.resolve({ address: [await bridge.getRootAddress()] }))?.pop(), 'Failed to resolve rootNode')
    return asNodeInstance(node, 'Not a NodeModule')
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to connect to XYO Node')
  }
}
