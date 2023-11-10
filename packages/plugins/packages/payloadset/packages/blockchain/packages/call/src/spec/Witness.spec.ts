import { InfuraProvider } from '@ethersproject/providers'
import { describeIf } from '@xylabs/jest-helpers'
import { ERC20__factory } from '@xyo-network/open-zeppelin-typechain'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { BlockchainCall, BlockchainCallResultSchema, BlockchainCallSchema } from '../Payload'
import { BlockchainCallWitness, BlockchainCallWitnessConfigSchema } from '../Witness'

const validateObservation = (observation: Payload[]) => {
  const results = observation.filter(isPayloadOfSchemaType(BlockchainCallResultSchema))
  expect(results.length).toBeGreaterThan(0)
  expect(observation.length).toEqual(results.length)
}

describeIf(process.env.INFURA_PROJECT_ID)('CryptoWalletNftWitness', () => {
  const address = '0x55296f69f40ea6d20e478533c15a6b08b654e758' //XYO ERC20
  const functionName = 'balanceOf'
  const args = ['0xaDe7DFBC532A01dB67BFEA3b728D4eA22869f381'] //Random Holder
  const provider = new InfuraProvider('homestead', {
    projectId: process.env.INFURA_PROJECT_ID,
    projectSecret: process.env.INFURA_PROJECT_SECRET,
  })
  describe('observe', () => {
    describe('with no address or chainId in query', () => {
      it('uses values from config', async () => {
        const witness = await BlockchainCallWitness.create({
          account: 'random',
          config: { contract: ERC20__factory.abi, schema: BlockchainCallWitnessConfigSchema },
          providers: [provider],
        })
        const call: BlockchainCall = { address, args, functionName, schema: BlockchainCallSchema }
        const observation = await witness.observe([call])
        await validateObservation(observation)
      })
    })
  })
})
