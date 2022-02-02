import { assertEx } from '@xylabs/sdk-js'
import { Buffer } from 'buffer'
import { ec } from 'elliptic'
import keccak256 from 'keccak256'
import shajs from 'sha.js'

class XyoAddress {
  private _key: ec.KeyPair

  static ecContext = new ec('secp256k1')

  private constructor(privateKey: Uint8Array) {
    assertEx(privateKey.length == 32, `Bad private key length [${privateKey.length}]`)
    this._key = XyoAddress.ecContext.keyFromPrivate(privateKey)
  }

  public get privateKey() {
    return this._key.getPrivate().toBuffer().toString('hex')
  }

  public get publicKey() {
    return this._key.getPublic('hex').slice(2)
  }

  public get address() {
    const publicKeyArray = this._key.getPublic('array')
    publicKeyArray.shift()
    return keccak256(Buffer.from(publicKeyArray)).subarray(12).toString('hex')
  }

  static fromPhrase(phrase: string) {
    const privateKey = shajs('sha256').update(phrase).digest('hex')
    return XyoAddress.fromPrivateKey(privateKey)
  }

  static fromPrivateKey(key: string) {
    const privateKey = Uint8Array.from(Buffer.from(key, 'hex'))
    return new XyoAddress(privateKey)
  }

  static random() {
    const key = XyoAddress.ecContext.genKeyPair()
    return XyoAddress.fromPrivateKey(key.getPrivate().toBuffer().toString('hex'))
  }
}

export { XyoAddress }
