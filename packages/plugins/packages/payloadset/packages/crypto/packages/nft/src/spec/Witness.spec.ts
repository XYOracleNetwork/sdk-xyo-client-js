// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { ExternalProvider } from '@ethersproject/providers'
import { describeIf } from '@xylabs/jest-helpers'
import { CryptoWalletNftPayload, CryptoWalletNftWitnessConfigSchema } from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { HttpProvider } from 'web3-providers-http'

import { CryptoWalletNftWitness } from '../Witness'

describeIf(process.env.INFURA_PROJECT_ID)('CryptoWalletNftWitness', () => {
  const address = '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a'
  const chainId = 1
  const network = 'homestead'
  test('observe', async () => {
    const apiKey = process.env.INFURA_PROJECT_ID
    const provider = new HttpProvider(`https://${network}.infura.io/v3/${apiKey}`) as unknown as ExternalProvider
    const witness = await CryptoWalletNftWitness.create({ config: { address, chainId, schema: CryptoWalletNftWitnessConfigSchema }, provider })
    const [observation] = (await witness.observe()) as CryptoWalletNftPayload[]
    expect(observation.nfts.length).toBeGreaterThan(1)
    expect(observation.timestamp).toBe(+now)
    const answerWrapper = PayloadWrapper.wrap(observation)
    expect(await answerWrapper.getValid()).toBe(true)
  })
})
