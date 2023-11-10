import { Payload } from '@xyo-network/payload-model'

export const BlockchainContractCallSchema = 'network.xyo.blockchain.contract.call'
export type BlockchainContractCallSchema = typeof BlockchainContractCallSchema

export type BlockchainContractCall = Payload<
  {
    address?: string
    args?: unknown[]
    functionName?: string
  },
  BlockchainContractCallSchema
>

export const BlockchainContractCallResultSchema = 'network.xyo.blockchain.contract.call.result'
export type BlockchainContractCallResultSchema = typeof BlockchainContractCallResultSchema

export type BlockchainContractCallResultBase = Payload<
  {
    address: string
    args: unknown[]
    chainId: number
    functionName: string
  },
  BlockchainContractCallResultSchema
>

export type BlockchainContractCallSuccess = BlockchainContractCallResultBase & {
  result: unknown
}

export type BlockchainContractCallFailure = BlockchainContractCallResultBase & {
  error: string
}

export type BlockchainContractCallResult = BlockchainContractCallSuccess | BlockchainContractCallFailure

export const isBlockchainContractCallSuccess = (payload?: BlockchainContractCallResult): payload is BlockchainContractCallSuccess => {
  return (payload as BlockchainContractCallSuccess | undefined)?.result !== undefined
}

export const isBlockchainContractCallFailure = (payload?: BlockchainContractCallResult): payload is BlockchainContractCallFailure => {
  return (payload as BlockchainContractCallFailure | undefined)?.error !== undefined
}

export const asBlockchainContractCallSuccess = (payload?: BlockchainContractCallResult) =>
  isBlockchainContractCallSuccess(payload) ? payload : undefined

export const asBlockchainContractCallFailure = (payload?: BlockchainContractCallResult) =>
  isBlockchainContractCallFailure(payload) ? payload : undefined
