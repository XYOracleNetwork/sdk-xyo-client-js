// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { InfuraProvider } from '@ethersproject/providers'
import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'
import { CryptoContractFunctionCall, CryptoContractFunctionCallSchema } from '@xyo-network/crypto-contract-function-read-payload-plugin'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { ManifestPayload, ManifestWrapper } from '@xyo-network/manifest'
import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module-model'
import { ERC721__factory, ERC1155__factory } from '@xyo-network/open-zeppelin-typechain'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { asSentinelInstance } from '@xyo-network/sentinel-model'
import { asWitnessInstance } from '@xyo-network/witness-model'

import { CryptoContractErc721Diviner, Erc721ContractInfo, Erc721ContractInfoSchema } from '../Erc721Diviner'
import erc721SentinelManifest from '../Erc721Sentinel.json'
import { CryptoContractErc1155Diviner } from '../Erc1155Diviner'
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
      locator.register(CryptoContractErc1155Diviner)
      locator.register(CryptoContractErc721Diviner)

      locator.register(
        new ModuleFactory(CryptoContractFunctionReadWitness, {
          factory: (address: string) => ERC721__factory.connect(address, provider),
        }),
        { 'network.xyo.crypto.contract.interface': 'Erc721' },
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

      const sentinel = asSentinelInstance(await node.resolve('Erc721InfoSentinel'))
      expect(sentinel).toBeDefined()

      const nameWitness = asWitnessInstance(await node.resolve('Erc721NameWitness'))
      expect(nameWitness).toBeDefined()

      const symbolWitness = asWitnessInstance(await node.resolve('Erc721SymbolWitness'))
      expect(symbolWitness).toBeDefined()

      const diviner = asDivinerInstance(await node.resolve('Erc721ContractInfoDiviner'))
      expect(diviner).toBeDefined()

      const callPayload: CryptoContractFunctionCall = { address, schema: CryptoContractFunctionCallSchema }
      const report = (await sentinel?.report([callPayload])) as Erc721ContractInfo[]
      console.log(`Report: ${JSON.stringify(report, null, 2)}`)
      expect(report.find(isPayloadOfSchemaType(Erc721ContractInfoSchema))?.symbol).toBe('HAAS')
    })
  })
})
