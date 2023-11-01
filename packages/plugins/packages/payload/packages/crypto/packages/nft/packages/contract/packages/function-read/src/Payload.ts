import { Payload } from '@xyo-network/payload-model'
import { WitnessConfig } from '@xyo-network/witness-model'

export const CryptoContractFunctionReadWitnessConfigSchema = 'network.xyo.crypto.contract.function.read.config'
export type CryptoContractFunctionReadWitnessConfigSchema = typeof CryptoContractFunctionReadWitnessConfigSchema

export type CryptoContractFunctionReadWitnessConfig<
  TFunctions extends string | number | symbol = string | number | symbol,
  TParams extends unknown[] = unknown[],
> = WitnessConfig<{
  call?: Partial<Omit<CryptoContractFunctionCall<TFunctions, TParams>, 'schema'>>
  schema: CryptoContractFunctionReadWitnessConfigSchema
}>

export const CryptoContractFunctionCallSchema = 'network.xyo.crypto.contract.function.call'
export type CryptoContractFunctionCallSchema = typeof CryptoContractFunctionCallSchema

export type CryptoContractFunctionCall<
  TFunctions extends string | number | symbol = string | number | symbol,
  TParams extends unknown[] = unknown[],
> = Payload<
  {
    address?: string
    functionName?: Extract<TFunctions, string>
    params?: TParams
  },
  CryptoContractFunctionCallSchema
>

export const CryptoContractFunctionCallResultSchema = 'network.xyo.crypto.contract.function.call.result'
export type CryptoContractFunctionCallResultSchema = typeof CryptoContractFunctionCallResultSchema

export type CryptoContractFunctionCallResult<TResult = unknown> = Payload<
  {
    address: string
    call: string
    chainId: number
    result: {
      type?: 'BigNumber'
      value: TResult
    }
  },
  CryptoContractFunctionCallResultSchema
>
