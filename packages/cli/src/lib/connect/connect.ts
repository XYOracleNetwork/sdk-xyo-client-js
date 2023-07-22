import { delay } from '@xylabs/delay'
import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { asNodeInstance, isNodeModule, NodeInstance } from '@xyo-network/node-model'

import { printError, printLine } from '../print'

const nodeConnectionErrorMsg = 'Error connecting to Node'

export const connect = async (attempts = 60, interval = 500): Promise<NodeInstance> => {
  // TODO: Configurable via config or dynamically determined
  const apiDomain = process.env.API_DOMAIN || 'http://localhost:8080'
  const apiConfig = { apiDomain }
  printLine(`Connecting to Node at: ${apiDomain}`)
  let count = 0
  do {
    try {
      const bridge = await HttpBridge.create({ config: { nodeUrl: `${apiConfig.apiDomain}`, schema: HttpBridgeConfigSchema } })
      printLine(`Connected Bridge at: ${apiDomain}`)
      printLine(`Local (Bridge) Address: 0x${bridge.address}`)
      printLine(`Remote (Root) Address: 0x${await bridge.getRootAddress()}`)

      //we are assuming the root here is a node module, but will check it
      const nodeModule = asNodeInstance(
        (await bridge.targetResolve(await bridge.getRootAddress(), { address: [await bridge.getRootAddress()] })).pop(),
        'Connected to root module that was not a node',
      )

      if (!nodeModule) {
        throw Error(`Tried to connect to a remote module that was not found [${apiDomain}]`)
      }

      if (!nodeModule || !isNodeModule(nodeModule)) {
        throw Error(`Tried to connect to a remote module that is not a node [${apiDomain}]`)
      }
      return nodeModule
    } catch (err) {
      count++
      await delay(interval)
      continue
    }
  } while (count < attempts)
  printError(nodeConnectionErrorMsg)
  throw new Error(nodeConnectionErrorMsg)
}
