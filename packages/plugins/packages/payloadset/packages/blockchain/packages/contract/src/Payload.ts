import { Payload } from '@xyo-network/payload-model'

export const BlockchainContractSchema = 'network.xyo.blockchain.contract'
export type BlockchainContractSchema = typeof BlockchainContractSchema

export type BlockchainContract = Payload<
  {
    address: string
    block: number
    chainId: number
    code?: string
  },
  BlockchainContractSchema
>
