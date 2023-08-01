import { assertEx } from '@xylabs/assert'
import { asNodeInstance, NodeInstance } from '@xyo-network/node-model'

import { printError } from '../../lib'
import { BaseArguments } from '../BaseArguments'
import { getBridge } from './getBridge'

export const getNode = async (args: BaseArguments): Promise<NodeInstance> => {
  const { verbose } = args
  try {
    const bridge = await getBridge(args)
    const node = assertEx((await bridge.resolve({ address: [await bridge.getRootAddress()] }))?.pop(), 'Failed to resolve rootNode')
    return asNodeInstance(node, 'Not a NodeModule')
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to connect to XYO Node')
  }
}
