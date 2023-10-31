import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import {
  CryptoContractFunctionCall,
  CryptoContractFunctionCallResult,
  CryptoContractFunctionCallResultSchema,
  CryptoContractFunctionCallSchema,
} from '@xyo-network/crypto-contract-function-read-payload-plugin'
import { DivinerConfig, DivinerParams } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export const CryptoContractErc721DivinerConfigSchema = 'network.xyo.crypto.contract.erc721.info.diviner.config'
export type CryptoContractErc721DivinerConfigSchema = typeof CryptoContractErc721DivinerConfigSchema

export type CryptoContractErc721DivinerConfig = DivinerConfig
export type CryptoContractErc721DivinerParams = DivinerParams<CryptoContractErc721DivinerConfig>

export const Erc721ContractInfoSchema = 'network.xyo.crypto.contract.erc721.info'
export type Erc721ContractInfoSchema = typeof Erc721ContractInfoSchema

export type Erc721ContractInfo = Payload<
  {
    name: string
    symbol: string
  },
  Erc721ContractInfoSchema
>

const generateCallHash = async (address: string, functionName: string, params: unknown[]) => {
  const callPayload: CryptoContractFunctionCall = {
    address,
    functionName,
    params,
    schema: CryptoContractFunctionCallSchema,
  }
  console.log(`generateCallHash: ${JSON.stringify(callPayload, null, 2)}`)
  const hash = await PayloadHasher.hashAsync(callPayload)
  console.log(`generateCallHash.hash: ${hash}`)
  return hash
}

const findCallResult = async (address: string, functionName: string, params: unknown[], payloads: CryptoContractFunctionCallResult[]) => {
  const callHash = await generateCallHash(address, functionName, params)
  const foundPayload = payloads.find((payload) => payload.call === callHash)
  return foundPayload?.result.value as string
}

export class CryptoContractErc721Diviner<
  TParams extends CryptoContractErc721DivinerParams = CryptoContractErc721DivinerParams,
> extends AbstractDiviner<TParams> {
  static override configSchemas = [CryptoContractErc721DivinerConfigSchema]
  protected override async divineHandler(inPayloads: CryptoContractFunctionCallResult[] = []): Promise<Erc721ContractInfo[]> {
    const callResults = inPayloads.filter(isPayloadOfSchemaType<CryptoContractFunctionCallResult>(CryptoContractFunctionCallResultSchema))
    const addresses = Object.keys(
      callResults.reduce<Record<string, boolean>>((prev, result) => {
        if (result.address) {
          prev[result.address] = true
        }
        return prev
      }, {}),
    )
    return await Promise.all(
      addresses.map(async (address) => {
        const erc721Info: Erc721ContractInfo = {
          name: await findCallResult(address, 'name', [], callResults),
          schema: Erc721ContractInfoSchema,
          symbol: await findCallResult(address, 'symbol', [], callResults),
        }
        return erc721Info
      }),
    )
  }
}
