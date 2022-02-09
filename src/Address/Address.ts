import { assertEx } from '@xylabs/sdk-js'
import { Buffer } from 'buffer'
import EC from 'elliptic'
import keccak256 from 'keccak256'
import shajs from 'sha.js'

//make sure we have a global Buffer object if in browser
const bufferPolyfill = () => {
  if (window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const global = window as any
    if (global.Buffer === undefined) {
      global.Buffer = Buffer
    }
  }
}

// we do this to allow node to import elliptic.   It cant handle {ec}
// eslint-disable-next-line import/no-named-as-default-member
const ec = EC.ec

export interface XyoAddressConfig {
  privateKey?: Uint8Array | string
  publicKey?: Uint8Array | string
  phrase?: string
}

const toUint8Array = (value: string | Uint8Array) => {
  if (typeof value === 'string') {
    return Uint8Array.from(Buffer.from(value, 'hex'))
  } else {
    return value
  }
}

export class XyoAddress {
  private _key: EC.ec.KeyPair

  static ecContext = new ec('secp256k1')

  constructor({ publicKey, privateKey, phrase }: XyoAddressConfig = {}) {
    bufferPolyfill()
    const privateKeyToUse = privateKey
      ? toUint8Array(privateKey)
      : phrase
      ? toUint8Array(shajs('sha256').update(phrase).digest('hex'))
      : undefined
    if (privateKeyToUse) {
      assertEx(privateKeyToUse.length == 32, `Bad private key length [${privateKeyToUse.length}]`)
      this._key = XyoAddress.ecContext.keyFromPrivate(privateKeyToUse)
    } else if (publicKey) {
      this._key = XyoAddress.ecContext.keyFromPublic(publicKey)
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

  public sign(hash: Uint8Array | string) {
    return Uint8Array.from(this._key.sign(toUint8Array(hash), 'string').toDER())
  }

  static fromPhrase(phrase: string) {
    const privateKey = shajs('sha256').update(phrase).digest('hex')
    return XyoAddress.fromPrivateKey(privateKey)
  }

  static fromPrivateKey(key: Uint8Array | string) {
    const privateKey = toUint8Array(key)
    return new XyoAddress({ privateKey })
  }

  static fromPublicKey(key: Uint8Array | string) {
    const publicKey = toUint8Array(key)
    return new XyoAddress({ publicKey })
  }

  static random() {
    const key = XyoAddress.ecContext.genKeyPair()
    return XyoAddress.fromPrivateKey(key.getPrivate().toBuffer().toString('hex'))
  }

  static verifyAddress(msg: Uint8Array | string, signature: Uint8Array | string, address: Uint8Array | string) {
    const publicKey = this.ecContext.recoverPubKey(toUint8Array(msg), toUint8Array(signature), 1)
    return new XyoAddress({ publicKey }).address === Buffer.from(toUint8Array(address)).toString('hex')
  }
}
