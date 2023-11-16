import { Address } from '@xyo-network/address'
import { Payload } from '@xyo-network/payload-model'

import { Erc1822Status } from './lib'

export const BlockchainErc1822StatusSchema = 'network.xyo.blockchain.erc1822.status'
export type BlockchainErc1822StatusSchema = typeof BlockchainErc1822StatusSchema

export type BlockchainErc1822Status = Payload<
  {
    address: Address
    block: number
    chainId: number
    implementation?: Erc1822Status['implementation']
    slots?: Erc1822Status['slots']
  },
  BlockchainErc1822StatusSchema
>
