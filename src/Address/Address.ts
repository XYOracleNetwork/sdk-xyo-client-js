import { assertEx } from '@xyo-network/sdk-xyo-js'
import * as ed25519 from 'noble-ed25519'
import shajs from 'sha.js'

class Address {
  private _privateKey: Uint8Array
  private _publicKey: Uint8Array

  private constructor(privateKey: Uint8Array, publicKey: Uint8Array) {
    assertEx(privateKey.length == 32, `Bad private key length [${privateKey.length}]`)
    assertEx(publicKey.length == 32, `Bad public key length [${publicKey.length}]`)
    this._privateKey = privateKey
    this._publicKey = publicKey
  }

  public get privateKey() {
    return Buffer.from(this._privateKey).toString('hex')
  }

  public get publicKey() {
    return Buffer.from(this._publicKey).toString('hex')
  }

  static fromPhrase(phrase: string) {
    const key = shajs('sha256').update(phrase).digest('hex')
    return Address.fromPrivateKey(key)
  }

  static async fromPrivateKey(key: string) {
    const privateKey = Uint8Array.from(Buffer.from(key, 'hex'))
    const publicKey = await ed25519.getPublicKey(privateKey)
    return new Address(privateKey, publicKey)
  }

  static async random() {
    const privateKey = ed25519.utils.randomPrivateKey()
    const publicKey = await ed25519.getPublicKey(privateKey)
    return new Address(privateKey, publicKey)
  }
}

export default Address
