import { describeIf } from '@xylabs/jest-helpers'
import { BlockchainAddressSchema, getProvidersFromEnv } from '@xyo-network/witness-blockchain-abstract'

import { BlockchainErc1822Witness, BlockchainErc1822WitnessConfigSchema } from '../Witness'

describeIf(process.env.INFURA_PROJECT_ID)('CryptoWalletNftWitness', () => {
  const address = '0x55296f69f40ea6d20e478533c15a6b08b654e758' //XYO ERC20
  describe('observe', () => {
    it('get code from contract', async () => {
      const witness = await BlockchainErc1822Witness.create({
        account: 'random',
        config: { schema: BlockchainErc1822WitnessConfigSchema },
        providers: getProvidersFromEnv,
      })
      const observation = await witness.observe([{ address, schema: BlockchainAddressSchema }])
      console.log(`o: ${JSON.stringify(observation, null, 2)}`)
      expect(observation[0].address).toBe(address)
      expect(observation[0].slots).toBeObject()
      expect(observation[0].implementation).toBeString()
    })
  })
})
