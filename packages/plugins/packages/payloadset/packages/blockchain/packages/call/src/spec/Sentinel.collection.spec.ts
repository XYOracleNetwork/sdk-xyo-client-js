/* eslint-disable max-statements */

import { BaseProvider } from '@ethersproject/providers'
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

import { BlockchainContractCallDiviner, BlockchainContractCallResults, BlockchainContractCallResultsSchema } from '../Diviner'
import { BlockchainContractCall, BlockchainContractCallSchema } from '../Payload'
import { BlockchainContractCallWitness } from '../Witness'
import erc721SentinelManifest from './Erc721Sentinel.json'
import { createProfiler, profile, profileReport } from './profiler'

const profiler = createProfiler()

const tokenCount = 0
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

  describeIf(providers)('report', () => {
    it('specifying address', async () => {
      profile(profiler, 'setup')
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromMnemonic(mnemonic)
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

      expect(info?.results?.name).toBe('BoredApeYachtClub')
      expect(info?.results?.symbol).toBe('BAYC')
    })
    afterAll(() => {
      const profileData = profileReport(profiler)
      if (profileData['tokenReport']) console.log(`Timer: ${profileData['tokenReport'] / tokenCount}ms`)
      console.log(`Profile: ${JSON.stringify(profileData, null, 2)}`)
    })
  })
})
