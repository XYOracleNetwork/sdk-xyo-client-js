import { HDNode } from '@ethersproject/hdnode'
import { assertEx } from '@xylabs/assert'
import { AccountOptions } from '@xyo-network/account-model'
import { DataLike, toUint8Array } from '@xyo-network/core'

import { Account } from './Account'

export interface HDAccountOptions extends AccountOptions {
  node: HDNode
}

export class HDAccount extends Account {
  protected constructor(protected readonly node: HDNode) {
    const privateKey: DataLike = toUint8Array(node.privateKey.replace('0x', ''))
    assertEx(!privateKey || privateKey?.length === 32, `Private key must be 32 bytes [${privateKey?.length}]`)
    super({ privateKey })
  }

  static override async create(node: HDNode): Promise<HDAccount> {
    return await new HDAccount(node).verifyUniqueAddress().loadPreviousHash()
  }
}
