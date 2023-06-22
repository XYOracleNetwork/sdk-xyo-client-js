// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { describeIf } from '@xylabs/jest-helpers'
import { isNftInfoPayload, NftWitnessConfigSchema } from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { HttpProvider } from 'web3-providers-http'

import { getExternalProviderFromHttpProvider } from '../lib'
import { CryptoWalletNftWitness } from '../Witness'

describeIf(process.env.INFURA_PROJECT_ID)('CryptoWalletNftWitness', () => {
  const address = '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a'
  const chainId = 1
  const network = 'homestead'
  test('observe', async () => {
    const apiKey = process.env.INFURA_PROJECT_ID
    const provider = getExternalProviderFromHttpProvider(new HttpProvider(`https://${network}.infura.io/v3/${apiKey}`))
    const witness = await CryptoWalletNftWitness.create({ config: { address, chainId, schema: NftWitnessConfigSchema }, provider })
    const observation = await witness.observe()
    const nfts = observation.filter(isNftInfoPayload)
    expect(nfts.length).toBeGreaterThan(0)
    expect(observation.length).toEqual(nfts.length)
    for (const nft of nfts) {
      const wrapped = PayloadWrapper.wrap(nft)
      expect(await wrapped.getValid()).toBe(true)
    }
  })
})
