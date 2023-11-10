/* eslint-disable max-statements */

import { BaseProvider } from '@ethersproject/providers'
import { BigNumber } from '@xylabs/bignumber'
import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { ManifestWrapper, PackageManifestPayload } from '@xyo-network/manifest'
import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module-model'
import { ERC721__factory, ERC721Enumerable__factory, ERC1155__factory } from '@xyo-network/open-zeppelin-typechain'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { asSentinelInstance } from '@xyo-network/sentinel-model'
import { getProviderFromEnv } from '@xyo-network/witness-blockchain-abstract'
import { asWitnessInstance } from '@xyo-network/witness-model'
import { Semaphore } from 'async-mutex'

import { BlockchainContractCallDiviner, BlockchainContractCallResults, BlockchainContractCallResultsSchema } from '../Diviner'
import { BlockchainContractCall, BlockchainContractCallResult, BlockchainContractCallResultSchema, BlockchainContractCallSchema } from '../Payload'
import { BlockchainContractCallWitness } from '../Witness'
import erc721SentinelManifest from './Erc721Sentinel.json'
import { createProfiler, profile, profileReport } from './profiler'

const profiler = createProfiler()

let tokenCount = 0
const maxProviders = 2

describe('Erc721Sentinel', () => {
  //const address = '0x562fC2927c77cB975680088566ADa1dC6cB8b5Ea' //Random ERC721
  const address = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' //Bored Apes

  const getProviders = () => {
    const providers: BaseProvider[] = []
    for (let i = 0; i < maxProviders; i++) {
      providers.push(getProviderFromEnv(1))
    }
    return providers
  }

  const providers = getProviders()

  describeIf(providers.length)('report', () => {
    it('specifying address', async () => {
      profile(profiler, 'setup')
      const wallet = await HDWallet.random()
      const locator = new ModuleFactoryLocator()
      locator.register(BlockchainContractCallDiviner)

      locator.register(
        new ModuleFactory(BlockchainContractCallWitness, {
          config: { contract: ERC721__factory.abi },
          providers: getProviders(),
        }),
        { 'network.xyo.blockchain.contract.interface': 'Erc721' },
      )

      locator.register(
        new ModuleFactory(BlockchainContractCallWitness, {
          config: { contract: ERC721Enumerable__factory.abi },
          providers: getProviders(),
        }),
        { 'network.xyo.blockchain.contract.interface': 'Erc721Enumerable' },
      )

      locator.register(
        new ModuleFactory(BlockchainContractCallWitness, {
          config: { contract: ERC1155__factory.abi },
          providers: getProviders(),
        }),
        { 'network.xyo.blockchain.contract.interface': 'Erc1155' },
      )

      profile(profiler, 'setup')
      profile(profiler, 'manifest')
      const manifest = new ManifestWrapper(erc721SentinelManifest as PackageManifestPayload, wallet, locator)
      profile(profiler, 'manifest-load')
      const node = await manifest.loadNodeFromIndex(0)
      profile(profiler, 'manifest-load')
      profile(profiler, 'manifest-resolve')
      const mods = await node.resolve()
      profile(profiler, 'manifest-resolve')
      profile(profiler, 'manifest')
      expect(mods.length).toBeGreaterThan(5)

      const collectionSentinel = asSentinelInstance(await node.resolve('NftInfoSentinel'))
      expect(collectionSentinel).toBeDefined()

      const tokenSentinel = asSentinelInstance(await node.resolve('Nft721TokenInfoSentinel'))
      expect(tokenSentinel).toBeDefined()

      const nameWitness = asWitnessInstance(await node.resolve('Erc721NameWitness'))
      expect(nameWitness).toBeDefined()

      const symbolWitness = asWitnessInstance(await node.resolve('Erc721SymbolWitness'))
      expect(symbolWitness).toBeDefined()

      const diviner = asDivinerInstance(await node.resolve('ContractInfoDiviner'))
      expect(diviner).toBeDefined()

      const collectionCallPayload: BlockchainContractCall = { address, schema: BlockchainContractCallSchema }
      profile(profiler, 'collectionReport')
      const report = await collectionSentinel?.report([collectionCallPayload])
      profile(profiler, 'collectionReport')
      profile(profiler, 'tokenCallSetup')
      const info = report?.find(isPayloadOfSchemaType(BlockchainContractCallResultsSchema)) as BlockchainContractCallResults | undefined

      const totalSupply = new BigNumber((info?.results?.totalSupply as string | undefined)?.replace('0x', '') ?? '0', 16).toNumber()
      expect(totalSupply).toBeGreaterThan(0)

      const chunkLimit = 5

      const chunkSize = 100
      const maxChunks = totalSupply / chunkSize
      const totalChunks = chunkLimit < maxChunks ? chunkLimit : maxChunks
      const limitedItems = totalChunks * chunkSize > totalSupply ? totalSupply : totalChunks * chunkSize
      const chunks: BlockchainContractCall[][] = []

      let offset = 0
      while (offset < totalSupply && chunks.length < totalChunks) {
        offset = chunks.length * chunkSize

        const chunkList: BlockchainContractCall[] = []

        for (let i = offset; i < offset + chunkSize && i < totalSupply; i++) {
          const call: BlockchainContractCall = {
            address,
            args: [`0x${new BigNumber(i).toString('hex')}`],
            functionName: 'tokenByIndex',
            schema: BlockchainContractCallSchema,
          }
          chunkList.push(call)
        }
        if (chunks.length < chunkLimit) {
          chunks.push(chunkList)
        }
      }
      profile(profiler, 'tokenCallSetup')
      const maxConcurrent = 8
      if (tokenSentinel) {
        profile(profiler, 'tokenReport')
        const semaphore = new Semaphore(maxConcurrent)
        const tokenReportArrays = await Promise.all(
          chunks.map(async (chunk, index) => {
            profile(profiler, `tokenReport-${index}`)
            const result = await semaphore.runExclusive(async () => {
              const result = await tokenSentinel.report(chunk)
              return result
            })
            profile(profiler, `tokenReport-${index}`)
            return result
          }),
        )
        profile(profiler, 'tokenReport')
        const tokenReport = tokenReportArrays.flat()
        tokenCount = tokenReport.length
        const tokenInfoPayloads = tokenReport.filter(isPayloadOfSchemaType(BlockchainContractCallResultSchema)) as BlockchainContractCallResult[]
        expect(tokenInfoPayloads.length).toBe(limitedItems)
      }
    })
    afterAll(() => {
      const profileData = profileReport(profiler)
      if (profileData['tokenReport']) console.log(`Timer: ${profileData['tokenReport'] / tokenCount}ms`)
      console.log(`Profile: ${JSON.stringify(profileData, null, 2)}`)
    })
  })
})
