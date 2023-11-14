import { Payload } from '@xyo-network/payload-model'

import { Erc1967Status } from './lib'

export const BlockchainErc1967StatusSchema = 'network.xyo.blockchain.erc1967.status'
export type BlockchainErc1967StatusSchema = typeof BlockchainErc1967StatusSchema

export type BlockchainErc1967Status = Payload<
  {
    address: string
    beacon?: Erc1967Status['beacon']
    block: number
    chainId: number
    implementation?: Erc1967Status['implementation']
    slots?: Erc1967Status['slots']
  },
  BlockchainErc1967StatusSchema
>
