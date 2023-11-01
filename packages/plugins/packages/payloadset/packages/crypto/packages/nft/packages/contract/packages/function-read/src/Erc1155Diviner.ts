import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import {
  CryptoContractFunctionCall,
  CryptoContractFunctionCallResult,
  CryptoContractFunctionCallResultSchema,
  CryptoContractFunctionCallSchema,
} from '@xyo-network/crypto-contract-function-read-payload-plugin'
import { DivinerConfig, DivinerParams } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export const CryptoContractErc1155DivinerConfigSchema = 'network.xyo.crypto.contract.erc1155.info.diviner.config'
export type CryptoContractErc1155DivinerConfigSchema = typeof CryptoContractErc1155DivinerConfigSchema

export type CryptoContractErc1155DivinerConfig = DivinerConfig
export type CryptoContractErc1155DivinerParams = DivinerParams<CryptoContractErc1155DivinerConfig>

export const Erc1155ContractInfoSchema = 'network.xyo.crypto.contract.erc1155.info'
export type Erc1155ContractInfoSchema = typeof Erc1155ContractInfoSchema

export type Erc1155ContractInfo = Payload<
  {
    uri: string
  },
  Erc1155ContractInfoSchema
>

const generateCallHash = async (address: string, functionName: string, params: unknown[]) => {
  const callPayload: CryptoContractFunctionCall = {
    address,
    functionName,
    params,
    schema: CryptoContractFunctionCallSchema,
  }
  return await PayloadHasher.hashAsync(callPayload)
}

const findCallResult = async (address: string, functionName: string, params: unknown[], payloads: CryptoContractFunctionCallResult[]) => {
  const callHash = await generateCallHash(address, functionName, params)
  const foundPayload = payloads.find((payload) => payload.call === callHash)
  return foundPayload?.result.value as string
}

export class CryptoContractErc1155Diviner<
  TParams extends CryptoContractErc1155DivinerParams = CryptoContractErc1155DivinerParams,
> extends AbstractDiviner<TParams> {
  static override configSchemas = [CryptoContractErc1155DivinerConfigSchema]
  protected override async divineHandler(inPayloads: CryptoContractFunctionCallResult[] = []): Promise<Erc1155ContractInfo[]> {
    const callResults = inPayloads.filter(isPayloadOfSchemaType<CryptoContractFunctionCallResult>(CryptoContractFunctionCallResultSchema))
    const addresses = Object.keys(
      callResults.reduce<Record<string, boolean>>((prev, result) => {
        if (result.address) {
          prev[result.address] = true
        }
        return prev
      }, {}),
    )
    const result = await Promise.all(
      addresses.map(async (address) => {
        const erc1155Info: Erc1155ContractInfo = {
          schema: Erc1155ContractInfoSchema,
          uri: await findCallResult(address, 'uri', [], callResults),
        }
        return erc1155Info
      }),
    )

    return result
  }
}
