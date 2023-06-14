import { EthereumGasEthgasstationSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { EthereumGasEthgasstationPlugin } from '../Plugin'
import { EthereumGasEthgasstationWitness } from '../Witness'

describe('EthereumGasEthgasstationPlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = EthereumGasEthgasstationPlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin, {
      config: { schema: EthereumGasEthgasstationWitness.configSchema },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(EthereumGasEthgasstationSchema)).toBeObject()
  })
})
