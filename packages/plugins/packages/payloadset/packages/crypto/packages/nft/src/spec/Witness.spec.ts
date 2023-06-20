// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { InfuraProvider } from '@ethersproject/providers'
import { CryptoWalletNftPayload, CryptoWalletNftWitnessConfigSchema } from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { CryptoWalletNftWitness } from '../Witness'

describe('CryptoWalletNftWitness', () => {
  test('observe', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET })
    const witness = await CryptoWalletNftWitness.create({
      config: {
        schema: CryptoWalletNftWitnessConfigSchema,
      },
      provider,
    })
    const [observation] = (await witness.observe()) as CryptoWalletNftPayload[]
    expect(observation.nfts.length).toBeGreaterThan(1)
    expect(observation.timestamp).toBe(+now)

    const answerWrapper = PayloadWrapper.wrap(observation)
    expect(await answerWrapper.getValid()).toBe(true)
  })
  test('observe [no config]', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET })
    const witness = await CryptoWalletNftWitness.create({
      config: {
        schema: CryptoWalletNftWitnessConfigSchema,
      },
      provider,
    })
    const [observation] = (await witness.observe()) as CryptoWalletNftPayload[]
    expect(observation.nfts.length).toBeGreaterThan(1)
    expect(observation.timestamp).toBe(+now)

    const answerWrapper = PayloadWrapper.wrap(observation)
    expect(await answerWrapper.getValid()).toBe(true)
  })
  test('observe [no params]', async () => {
    const didThrow = async () => {
      try {
        await CryptoWalletNftWitness.create()
        return false
      } catch {
        return true
      }
    }
    expect(await didThrow()).toBe(true)
  })
})
