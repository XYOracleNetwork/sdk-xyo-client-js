// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { InfuraProvider } from '@ethersproject/providers'
import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import CryptoContractFunctionCallPayloadPlugin, {
  CryptoContractFunctionCall,
  CryptoContractFunctionCallSchema,
  CryptoContractFunctionReadWitnessConfigSchema,
} from '@xyo-network/crypto-contract-function-read-payload-plugin'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { ManifestPayload, ManifestWrapper } from '@xyo-network/manifest'
import { ERC721__factory } from '@xyo-network/open-zeppelin-typechain'
import { asSentinelInstance } from '@xyo-network/sentinel-model'
import { asWitnessInstance } from '@xyo-network/witness-model'

import { CryptoContractErc721Diviner, CryptoContractErc721DivinerConfigSchema, Erc721ContractInfo } from '../Erc721Diviner'
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
      const manifest = new ManifestWrapper(erc721SentinelManifest as ManifestPayload, wallet)
      const node = await manifest.loadNodeFromIndex(0, {
        [CryptoContractErc721DivinerConfigSchema]: CryptoContractErc721Diviner,
        [CryptoContractFunctionReadWitnessConfigSchema]: CryptoContractFunctionReadWitness.factory({
          factory: (address: string) => ERC721__factory.connect(address, provider),
        }),
      })
      const mods = await node.resolve()
      expect(mods.length).toBe(5)
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
      expect(report[0].name).toBe('X')
    })
  })
})
