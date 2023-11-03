import { ContractInterface } from '@ethersproject/contracts'
import { Payload } from '@xyo-network/payload-model'
import { WitnessConfig } from '@xyo-network/witness-model'

export const CryptoContractFunctionReadWitnessConfigSchema = 'network.xyo.crypto.contract.function.read.config'
export type CryptoContractFunctionReadWitnessConfigSchema = typeof CryptoContractFunctionReadWitnessConfigSchema

export type CryptoContractFunctionReadWitnessConfig = WitnessConfig<{
  address?: string
  args?: unknown[]
  contract: ContractInterface
  functionName?: string
  schema: CryptoContractFunctionReadWitnessConfigSchema
}>

export const CryptoContractFunctionCallSchema = 'network.xyo.crypto.contract.function.call'
export type CryptoContractFunctionCallSchema = typeof CryptoContractFunctionCallSchema

export type CryptoContractFunctionCall = Payload<
  {
    address?: string
    args?: unknown[]
    functionName?: string
  },
  CryptoContractFunctionCallSchema
>

export const CryptoContractFunctionCallResultSchema = 'network.xyo.crypto.contract.function.call.result'
export type CryptoContractFunctionCallResultSchema = typeof CryptoContractFunctionCallResultSchema

export type CryptoContractFunctionCallResult = Payload<
  {
    address: string
    args: unknown[]
    chainId: number
    functionName: string
    result: unknown
  },
  CryptoContractFunctionCallResultSchema
>
