import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerConfig, DivinerParams } from '@xyo-network/diviner-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { asBlockchainContractCallSuccess, BlockchainContractCallResult, BlockchainContractCallResultSchema } from './Payload'

export type FindCallResult<TResult = string, TPayload = Payload> = [TResult, TPayload] | [undefined, TPayload] | [undefined, undefined]

export const BlockchainContractCallDivinerConfigSchema = 'network.xyo.blockchain.contract.call.diviner.config'
export type BlockchainContractCallDivinerConfigSchema = typeof BlockchainContractCallDivinerConfigSchema

export type BlockchainContractCallDivinerConfig = DivinerConfig<{
  schema: BlockchainContractCallDivinerConfigSchema
}>
export type BlockchainContractCallDivinerParams = DivinerParams<BlockchainContractCallDivinerConfig>

export const BlockchainContractCallResultsSchema = 'network.xyo.blockchain.contract.call.results'
export type BlockchainContractCallResultsSchema = typeof BlockchainContractCallResultsSchema

export type BlockchainContractCallResults = Payload<
  {
    address: string
    chainId: string
    results?: Record<string, unknown>
  },
  BlockchainContractCallResultsSchema
>

export class BlockchainContractCallDiviner<
  TParams extends BlockchainContractCallDivinerParams = BlockchainContractCallDivinerParams,
> extends AbstractDiviner<TParams> {
  static override configSchemas = [BlockchainContractCallDivinerConfigSchema]

  protected static findCallResult<TResult = string>(
    address: string,
    functionName: string,
    payloads: BlockchainContractCallResult[],
  ): TResult | undefined {
    const foundPayload = payloads.find((payload) => payload.functionName === functionName && payload.address === address)
    return asBlockchainContractCallSuccess(foundPayload)?.result as TResult | undefined
  }

  protected static matchingExistingField<R = string, T extends Payload = Payload>(objs: T[], field: keyof T): R | undefined {
    const expectedValue = objs.at(0)?.[field] as R
    const didNotMatch = objs.reduce((prev, obj) => {
      return prev || obj[field] !== expectedValue
    }, false)
    return didNotMatch ? undefined : expectedValue
  }

  protected contractInfoRequiredFields(callResults: BlockchainContractCallResult[]): BlockchainContractCallResults {
    return {
      address: assertEx(BlockchainContractCallDiviner.matchingExistingField(callResults, 'address'), 'Mismatched address'),
      chainId: assertEx(BlockchainContractCallDiviner.matchingExistingField(callResults, 'chainId'), 'Mismatched chainId'),
      schema: BlockchainContractCallResultsSchema,
    }
  }

  protected override async divineHandler(inPayloads: BlockchainContractCallResult[] = []): Promise<BlockchainContractCallResults[]> {
    const callResults = inPayloads.filter(isPayloadOfSchemaType<BlockchainContractCallResult>(BlockchainContractCallResultSchema))
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
        const foundCallResults = callResults.filter((callResult) => callResult.address === address)
        const results: BlockchainContractCallResults = {
          ...{ results: await this.reduceResults(foundCallResults) },
          ...this.contractInfoRequiredFields(foundCallResults),
        }
        return results
      }),
    )

    return result
  }

  protected reduceResults(callResults: BlockchainContractCallResult[]): Promisable<BlockchainContractCallResults['results']> {
    return callResults.reduce<Record<string, unknown>>((prev, callResult) => {
      prev[callResult.functionName] = asBlockchainContractCallSuccess(callResult)?.result
      return prev
    }, {})
  }
}
