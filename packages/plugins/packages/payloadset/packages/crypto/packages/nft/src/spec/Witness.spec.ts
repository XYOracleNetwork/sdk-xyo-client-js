// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { CryptoWalletNftPayload, CryptoWalletNftWitnessConfigSchema } from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { CryptoWalletNftWitness } from '../Witness'

describe('CryptoWalletNftWitness', () => {
  const address = '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a'
  const chainId = 1
  test('observe', async () => {
    const witness = await CryptoWalletNftWitness.create({ config: { address, chainId, schema: CryptoWalletNftWitnessConfigSchema } })
    const [observation] = (await witness.observe()) as CryptoWalletNftPayload[]
    expect(observation.nfts.length).toBeGreaterThan(1)
    expect(observation.timestamp).toBe(+now)
    const answerWrapper = PayloadWrapper.wrap(observation)
    expect(await answerWrapper.getValid()).toBe(true)
  })
})
