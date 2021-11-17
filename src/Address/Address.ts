import { assertEx } from '@xylabs/sdk-js'
import { ec } from 'elliptic'
import shajs from 'sha.js'

class XyoAddress {
  private _key: ec.KeyPair

  static ecContext = new ec('p256')

  private constructor(privateKey: Uint8Array) {
    assertEx(privateKey.length == 32, `Bad private key length [${privateKey.length}]`)
    this._key = XyoAddress.ecContext.keyFromPrivate(privateKey)
  }

  public get privateKey() {
    return this._key.getPrivate().toBuffer().toString('hex')
  }

  public get publicKey() {
    return this._key.getPublic().encode('hex', true).slice(2)
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
