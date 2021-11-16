import { assertEx } from '@xylabs/sdk-js'
import { ec } from 'elliptic'
import shajs from 'sha.js'

class Address {
  private _key: ec.KeyPair

  static ecContext = new ec('p256')

  private constructor(privateKey: Uint8Array) {
    assertEx(privateKey.length == 32, `Bad private key length [${privateKey.length}]`)
    this._key = Address.ecContext.keyFromPrivate(privateKey)
  }

  public get privateKey() {
    return this._key.getPrivate().toBuffer().toString('hex')
  }

  public get publicKey() {
    return this._key.getPublic().encode('hex', true).slice(2)
  }

  static fromPhrase(phrase: string) {
    const privateKey = shajs('sha256').update(phrase).digest('hex')
    return Address.fromPrivateKey(privateKey)
  }

  static fromPrivateKey(key: string) {
    const privateKey = Uint8Array.from(Buffer.from(key, 'hex'))
    return new Address(privateKey)
  }

  static random() {
    const key = Address.ecContext.genKeyPair()
    return Address.fromPrivateKey(key.getPrivate().toBuffer().toString('hex'))
  }
}

export default Address
