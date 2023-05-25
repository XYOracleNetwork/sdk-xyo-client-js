import { HDNode } from '@ethersproject/hdnode'
import { assertEx } from '@xylabs/assert'
import { AccountOptions } from '@xyo-network/account-model'
import { DataLike, toUint8Array, XyoData } from '@xyo-network/core'

import { Account } from './Account'

export class HDAccount extends Account {
  constructor(protected readonly node: HDNode, opts?: AccountOptions) {
    const privateKey: DataLike = toUint8Array(node.privateKey.replace('0x', ''))
    assertEx(!privateKey || privateKey?.length === 32, `Private key must be 32 bytes [${privateKey?.length}]`)
    super({ privateKey })
    if (opts?.previousHash) this._previousHash = new XyoData(32, opts.previousHash)
  }
}
