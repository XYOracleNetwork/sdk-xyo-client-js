import { EthereumGasBlocknativeSchema } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { EthereumGasBlocknativePlugin } from '../Plugin'
import { EthereumGasBlocknativeWitness } from '../Witness'

describe('EthereumGasBlocknativePlugin', () => {
  test('Add to Resolver', async () => {
    const plugin = EthereumGasBlocknativePlugin()
    const resolver = await new PayloadSetPluginResolver().register(plugin, {
      config: { schema: EthereumGasBlocknativeWitness.configSchema },
    })
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(EthereumGasBlocknativeSchema)).toBeObject()
  })
})
