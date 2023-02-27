import { HDNode } from '@ethersproject/hdnode'
import { assertEx } from '@xylabs/assert'
import { AccountInstance, AccountOptions } from '@xyo-network/account-model'
import { DataLike, toUint8Array, XyoData } from '@xyo-network/core'

import { KeyPair } from './Key'

export class HDAccount extends KeyPair implements AccountInstance {
  private _previousHash?: XyoData

  constructor(protected readonly node: HDNode, opts?: AccountOptions) {
    const privateKeyToUse: DataLike = toUint8Array(node.privateKey.replace('0x', ''))
    assertEx(!privateKeyToUse || privateKeyToUse?.length === 32, `Private key must be 32 bytes [${privateKeyToUse?.length}]`)
    super(privateKeyToUse)
    if (opts?.previousHash) this._previousHash = new XyoData(32, opts.previousHash)
  }

  get addressValue() {
    return this.public.address
  }

  get previousHash() {
    return this._previousHash
  }

  sign(hash: Uint8Array | string) {
    this._previousHash = new XyoData(32, hash)
    return this.private.sign(hash)
  }

  verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    return this.public.address.verify(msg, signature)
  }
}
