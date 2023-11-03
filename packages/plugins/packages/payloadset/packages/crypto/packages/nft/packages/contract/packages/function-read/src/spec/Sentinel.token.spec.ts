/* eslint-disable max-statements */

import { InfuraProvider, WebSocketProvider } from '@ethersproject/providers'
import { BigNumber } from '@xylabs/bignumber'
import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'
import {
  CryptoContractFunctionCall,
  CryptoContractFunctionCallResultSchema,
  CryptoContractFunctionCallSchema,
} from '@xyo-network/crypto-contract-function-read-payload-plugin'
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

const profileData: Record<string, number[]> = {}

const profile = (name: string) => {
  const timeData = profileData[name] ?? []
  timeData.push(Date.now())
  profileData[name] = timeData
}

const profileReport = () => {
  let lowest = Date.now()
  let highest = 0
  const results = Object.entries(profileData).reduce<Record<string, number>>((prev, [name, readings]) => {
    const start = readings.at(0)
    if (start) {
      if (start < lowest) {
        lowest = start
      }
      const end = readings.at(-1) ?? Date.now()
      if (end > highest) {
        highest = end
      }
      prev[name] = end - start
    }
    return prev
  }, {})
  if (highest) {
    results['-all-'] = highest - lowest
  }
  return results
}

let tokenCount = 0

describeIf(process.env.INFURA_PROJECT_ID)('Erc721Sentinel', () => {
  //const address = '0x562fC2927c77cB975680088566ADa1dC6cB8b5Ea' //Random ERC721
  const address = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' //Bored Apes
  const infuraProvider = new InfuraProvider('homestead', {
    projectId: process.env.INFURA_PROJECT_ID,
    projectSecret: process.env.INFURA_PROJECT_SECRET,
  })

  const quickNodeUri = process.env.QUICKNODE_WSS_URI
  const quickNodeProvider = quickNodeUri ? new WebSocketProvider(quickNodeUri, 'homestead') : undefined

  const provider = quickNodeProvider ?? infuraProvider

  describe('report', () => {
    it('specifying address', async () => {
      profile('setup')
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromMnemonic(mnemonic)
      const locator = new ModuleFactoryLocator()
      locator.register(CryptoContractDiviner)

      locator.register(
        new ModuleFactory(CryptoContractFunctionReadWitness, {
          config: { contract: ERC721__factory.abi },
          provider,
        }),
        { 'network.xyo.crypto.contract.interface': 'Erc721' },
      )

      locator.register(
        new ModuleFactory(CryptoContractFunctionReadWitness, {
          config: { contract: ERC721Enumerable__factory.abi },
          provider,
        }),
        { 'network.xyo.crypto.contract.interface': 'Erc721Enumerable' },
      )

      locator.register(
        new ModuleFactory(CryptoContractFunctionReadWitness, {
          config: { contract: ERC1155__factory.abi },
          provider,
        }),
        { 'network.xyo.crypto.contract.interface': 'Erc1155' },
      )
      profile('setup')
      profile('manifest')
      const manifest = new ManifestWrapper(erc721SentinelManifest as ManifestPayload, wallet, locator)
      profile('manifest-load')
      const node = await manifest.loadNodeFromIndex(0)
      profile('manifest-load')
      profile('manifest-resolve')
      const mods = await node.resolve()
      profile('manifest-resolve')
      profile('manifest')
      expect(mods.length).toBeGreaterThan(5)

      const collectionSentinel = asSentinelInstance(await node.resolve('NftInfoSentinel'))
      expect(collectionSentinel).toBeDefined()

      const tokenSentinel = asSentinelInstance(await node.resolve('NftTokenInfoSentinel'))
      expect(tokenSentinel).toBeDefined()

      const nameWitness = asWitnessInstance(await node.resolve('Erc721NameWitness'))
      expect(nameWitness).toBeDefined()

      const symbolWitness = asWitnessInstance(await node.resolve('Erc721SymbolWitness'))
      expect(symbolWitness).toBeDefined()

      const diviner = asDivinerInstance(await node.resolve('Erc721ContractInfoDiviner'))
      expect(diviner).toBeDefined()

      const collectionCallPayload: CryptoContractFunctionCall = { address, schema: CryptoContractFunctionCallSchema }
      profile('collectionReport')
      const report = await collectionSentinel?.report([collectionCallPayload])
      profile('collectionReport')
      profile('tokenCallSetup')
      const info = report?.find(isPayloadOfSchemaType(ContractInfoSchema)) as ContractInfo | undefined

      const totalSupply = new BigNumber((info?.results?.totalSupply as string | undefined)?.replace('0x', '') ?? '0', 16).toNumber()
      expect(totalSupply).toBeGreaterThan(0)

      const tokenCallPayloads: CryptoContractFunctionCall[] = []

      const maxTotalSupply = 40
      const limitedTotalSupply = totalSupply > maxTotalSupply ? maxTotalSupply : totalSupply
      tokenCount = limitedTotalSupply

      for (let i = 0; i < limitedTotalSupply; i++) {
        const call: CryptoContractFunctionCall = {
          address,
          args: [`0x${new BigNumber(i).toString('hex')}`],
          functionName: 'tokenByIndex',
          schema: CryptoContractFunctionCallSchema,
        }
        tokenCallPayloads.push(call)
      }
      profile('tokenCallSetup')
      profile('tokenReport')
      const tokenReport = await tokenSentinel?.report(tokenCallPayloads)
      profile('tokenReport')
      const tokenInfoPayloads = tokenReport?.filter(isPayloadOfSchemaType(CryptoContractFunctionCallResultSchema)) as ContractInfo[]
      expect(tokenInfoPayloads.length).toBe(limitedTotalSupply)
    })
    afterAll(() => {
      const profileData = profileReport()
      if (profileData['tokenReport']) console.log(`Timer: ${profileData['tokenReport'] / tokenCount}ms`)
      console.log(`Profile: ${JSON.stringify(profileData, null, 2)}`)
    })
  })
})
