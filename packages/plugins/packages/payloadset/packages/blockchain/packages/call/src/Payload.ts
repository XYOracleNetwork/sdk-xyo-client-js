import { Payload } from '@xyo-network/payload-model'

export const BlockchainCallSchema = 'network.xyo.blockchain.call'
export type BlockchainCallSchema = typeof BlockchainCallSchema

export type BlockchainCall = Payload<
  {
    address?: string
    args?: unknown[]
    functionName?: string
  },
  BlockchainCallSchema
>

export const BlockchainCallResultSchema = 'network.xyo.blockchain.call.result'
export type BlockchainCallResultSchema = typeof BlockchainCallResultSchema

export type BlockchainCallResultBase = Payload<
  {
    address: string
    args: unknown[]
    chainId: number
    functionName: string
  },
  BlockchainCallResultSchema
>

export type BlockchainCallSuccess = BlockchainCallResultBase & {
  result: unknown
}

export type BlockchainCallFailure = BlockchainCallResultBase & {
  error: string
}

export type BlockchainCallResult = BlockchainCallSuccess | BlockchainCallFailure

export const isBlockchainCallSuccess = (payload?: BlockchainCallResult): payload is BlockchainCallSuccess => {
  return (payload as BlockchainCallSuccess | undefined)?.result !== undefined
}

export const isBlockchainCallFailure = (payload?: BlockchainCallResult): payload is BlockchainCallFailure => {
  return (payload as BlockchainCallFailure | undefined)?.error !== undefined
}

export const asBlockchainCallSuccess = (payload?: BlockchainCallResult) => (isBlockchainCallSuccess(payload) ? payload : undefined)

export const asBlockchainCallFailure = (payload?: BlockchainCallResult) => (isBlockchainCallFailure(payload) ? payload : undefined)
