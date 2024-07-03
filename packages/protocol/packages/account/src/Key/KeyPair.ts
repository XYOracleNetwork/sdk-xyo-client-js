import { staticImplements } from '@xylabs/static-implements'
import { KeyPairInstance, KeyPairStatic, PrivateKeyInstance, PublicKeyInstance } from '@xyo-network/key-model'

@staticImplements<KeyPairStatic>()
export class KeyPair implements KeyPairInstance {
  private _isXyoKeyPair = true
  private _private: PrivateKeyInstance

  constructor(privateKey: PrivateKeyInstance) {
    this._private = privateKey
  }

  static isXyoKeyPair(value: unknown) {
    return (value as KeyPair)._isXyoKeyPair
  }

  getPrivate() {
    return this._private
  }

  async getPublic(): Promise<PublicKeyInstance> {
    return await this.getPrivate().getPublic()
  }
}
