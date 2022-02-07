import { assertEx } from '@xylabs/sdk-js'
import { Buffer } from 'buffer'
import EC from 'elliptic'
import keccak256 from 'keccak256'
import shajs from 'sha.js'

// we do this to allow node to import elliptic.   It cant handle {ec}
// eslint-disable-next-line import/no-named-as-default-member
const ec = EC.ec

export interface XyoAddressConfig {
  privateKey?: Uint8Array
  phrase?: string
}

export class XyoAddress {
  private _key: EC.ec.KeyPair

  static ecContext = new ec('secp256k1')

  constructor({ privateKey, phrase }: XyoAddressConfig = {}) {
    const privateKeyToUse =
      privateKey ?? (phrase ? Buffer.from(shajs('sha256').update(phrase).digest('hex'), 'hex') : undefined)
    if (privateKeyToUse) {
      assertEx(privateKeyToUse.length == 32, `Bad private key length [${privateKeyToUse.length}]`)
      this._key = XyoAddress.ecContext.keyFromPrivate(privateKeyToUse)
    } else {
      this._key = XyoAddress.ecContext.genKeyPair()
    }
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
    return new XyoAddress({ privateKey })
  }

  static random() {
    const key = XyoAddress.ecContext.genKeyPair()
    return XyoAddress.fromPrivateKey(key.getPrivate().toBuffer().toString('hex'))
  }
}
