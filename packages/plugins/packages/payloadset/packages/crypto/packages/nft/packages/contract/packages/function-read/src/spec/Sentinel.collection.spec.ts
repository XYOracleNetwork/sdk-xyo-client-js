// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { InfuraProvider } from '@ethersproject/providers'
import { BigNumber } from '@xylabs/bignumber'
import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'
import { CryptoContractFunctionCall, CryptoContractFunctionCallSchema } from '@xyo-network/crypto-contract-function-read-payload-plugin'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { ManifestPayload, ManifestWrapper } from '@xyo-network/manifest'
import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module-model'
import { ERC721__factory, ERC721Enumerable__factory, ERC1155__factory } from '@xyo-network/open-zeppelin-typechain'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { asSentinelInstance } from '@xyo-network/sentinel-model'
import { asWitnessInstance } from '@xyo-network/witness-model'

import { ContractInfo, ContractInfoSchema, CryptoContractDiviner } from '../CryptoContractDiviner'
import erc721SentinelManifest from '../Erc721Sentinel.json'
import { CryptoContractFunctionReadWitness } from '../Witness'

describeIf(process.env.INFURA_PROJECT_ID)('Erc721Sentinel', () => {
  const address = '0x562fC2927c77cB975680088566ADa1dC6cB8b5Ea' //Random ERC721
  const provider = new InfuraProvider('homestead', {
    projectId: process.env.INFURA_PROJECT_ID,
    projectSecret: process.env.INFURA_PROJECT_SECRET,
  })
  describe('report', () => {
    it('specifying address', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromMnemonic(mnemonic)
      const locator = new ModuleFactoryLocator()
      locator.register(CryptoContractDiviner)

      locator.register(
        new ModuleFactory(CryptoContractFunctionReadWitness, {
          factory: (address: string) => ERC721__factory.connect(address, provider),
        }),
        { 'network.xyo.crypto.contract.interface': 'Erc721' },
      )

      locator.register(
        new ModuleFactory(CryptoContractFunctionReadWitness, {
          factory: (address: string) => ERC721Enumerable__factory.connect(address, provider),
        }),
        { 'network.xyo.crypto.contract.interface': 'Erc721Enumerable' },
      )

      locator.register(
        new ModuleFactory(CryptoContractFunctionReadWitness, {
          factory: (address: string) => ERC1155__factory.connect(address, provider),
        }),
        { 'network.xyo.crypto.contract.interface': 'Erc1155' },
      )

      const manifest = new ManifestWrapper(erc721SentinelManifest as ManifestPayload, wallet, locator)
      const node = await manifest.loadNodeFromIndex(0)
      const mods = await node.resolve()
      expect(mods.length).toBeGreaterThan(5)

      const collectionSentinel = asSentinelInstance(await node.resolve('NftInfoSentinel'))
      expect(collectionSentinel).toBeDefined()

      const tokenSentinel = asSentinelInstance(await node.resolve('NftInfoSentinel'))
      expect(tokenSentinel).toBeDefined()

      const nameWitness = asWitnessInstance(await node.resolve('Erc721NameWitness'))
      expect(nameWitness).toBeDefined()

      const symbolWitness = asWitnessInstance(await node.resolve('Erc721SymbolWitness'))
      expect(symbolWitness).toBeDefined()

      const diviner = asDivinerInstance(await node.resolve('Erc721ContractInfoDiviner'))
      expect(diviner).toBeDefined()

      const collectionCallPayload: CryptoContractFunctionCall = { address, schema: CryptoContractFunctionCallSchema }
      const report = await collectionSentinel?.report([collectionCallPayload])
      const info = report?.find(isPayloadOfSchemaType(ContractInfoSchema)) as ContractInfo | undefined
      expect(info?.results?.['symbol']?.value).toBe('HAAS')

      const totalSupply = new BigNumber((info?.results?.totalSupply.value as string).replace('0x', ''), 16).toNumber()
      expect(totalSupply).toBeGreaterThan(0)
    })
  })
})
