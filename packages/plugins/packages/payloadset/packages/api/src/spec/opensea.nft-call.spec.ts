/* eslint-disable max-statements */

import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'
import { ManifestWrapper, PackageManifestPayload } from '@xyo-network/manifest'
import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { asSentinelInstance } from '@xyo-network/sentinel-model'
import { asWitnessInstance } from '@xyo-network/witness-model'

import { ApiCallJsonResult, ApiCallResult, ApiCallResultSchema, ApiCallSchema, ApiUriTemplateCall } from '../Payload'
import { ApiCallWitness } from '../Witness'
import openseaNftsManifest from './opensea.nft-call.json'

describe('OpenSeaApi', () => {
  const address = '0xECA1bB9c8d3Fd8b926372f42c8D4c6c3ed0669B3' //Random Wallet

  const apiKey = process.env.OPENSEA_API_KEY

  describeIf(apiKey)('report', () => {
    it('specifying address', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromMnemonic(mnemonic)
      const locator = new ModuleFactoryLocator()

      locator.register(
        new ModuleFactory(ApiCallWitness, {
          config: { uriTemplate: 'https://api.opensea.io/api/v2/chain/ethereum/account/${address}/nfts' },
          headers: { 'x-api-key': apiKey },
        }),
      )

      const manifest = new ManifestWrapper(openseaNftsManifest as PackageManifestPayload, wallet, locator)

      const node = await manifest.loadNodeFromIndex(0)

      const mods = await node.resolve()

      expect(mods.length).toBeGreaterThan(1)

      const resolvedWitness = await node.resolve('ApiCallWitness')
      expect(resolvedWitness).toBeDefined()

      const witness = asWitnessInstance(resolvedWitness)
      expect(witness).toBeDefined()

      const sentinel = asSentinelInstance(await node.resolve('ApiCallSentinel'))
      expect(sentinel).toBeDefined()

      const call: ApiUriTemplateCall = { params: { address }, schema: ApiCallSchema }

      const report = await sentinel?.report([call])

      const apiCallResult = report?.find(isPayloadOfSchemaType(ApiCallResultSchema)) as ApiCallResult | undefined

      expect(apiCallResult?.schema).toBeString()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((apiCallResult as ApiCallJsonResult<any>)?.data.nfts).toBeArrayOfSize(1)
    })
  })
})
