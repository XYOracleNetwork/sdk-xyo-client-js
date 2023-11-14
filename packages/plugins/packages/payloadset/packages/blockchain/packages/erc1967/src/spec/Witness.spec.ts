import { describeIf } from '@xylabs/jest-helpers'
import { getProviderFromEnv } from '@xyo-network/witness-blockchain-abstract'

import { BlockchainAddressSchema } from '../Payload'
import { BlockchainErc1967Witness, BlockchainErc1967WitnessConfigSchema } from '../Witness'

describeIf(process.env.INFURA_PROJECT_ID)('CryptoWalletNftWitness', () => {
  const address = '0x55296f69f40ea6d20e478533c15a6b08b654e758' //XYO ERC20
  describe('observe', () => {
    it('get code from contract', async () => {
      const provider = getProviderFromEnv()
      const witness = await BlockchainErc1967Witness.create({
        account: 'random',
        config: { schema: BlockchainErc1967WitnessConfigSchema },
        providers: [provider],
      })
      const observation = await witness.observe([{ address, schema: BlockchainAddressSchema }])
      console.log(`o: ${JSON.stringify(observation, null, 2)}`)
      expect(observation[0].address).toBe(address)
      expect(observation[0].slots).toBeObject()
      expect(observation[0].implementation).toBeString()
    })
  })
})
