/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */

import { toUint8Array } from '@xyo-network/core'

import { Account } from '../Account'

//test vectors: https://tools.ietf.org/html/rfc8032
//test tool: https://asecuritysite.com/encryption/ethadd

const testVectorPrivateKey = '7f71bc5644f8f521f7e9b73f7a391e82c05432f8a9d36c44d6b1edbf1d8db62f'
const testVectorPublicKey =
  'ed6f3b86542f45aab88ec48ab1366b462bd993fec83e234054afd8f2311fba774800fdb40c04918463b463a6044b83413a604550bfba8f8911beb65475d6528e'
const testVectorAddress = '5e7a847447e7fec41011ae7d32d768f86605ba03'
const testVectorHash = '4b688df40bcedbe641ddb16ff0a1842d9c67ea1c3bf63f3e0471baa664531d1a'
const testVectorSignature =
  'b61dad551e910e2793b4f9f880125b5799086510ce102fad0222c1b093c60a6b38aa35ef56f97f86537269e8be95832aaa37d3b64d86b67f0cda467ac7cb5b3e'

const testPrivateKey = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
const testPublicKey =
  '5f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca54ba511b8b782bc5085962412e8b9879496e3b60bebee7c36987d1d5848b9a50'
const testAddress = '2a260a110bc7b03f19c40a0bd04ff2c5dcb57594'

/*const testVectors = {
  d: 'ebb2c082fd7727890a28ac82f6bdf97bad8de9f5d7c9028692de1a255cad3e0f',
  k: '49a0d7b786ec9cde0d0721d72804befd06571c974b191efb42ecf322ba9ddd9a',
  h: '4b688df40bcedbe641ddb16ff0a1842d9c67ea1c3bf63f3e0471baa664531d1a',
  r: '241097efbf8b63bf145c8961dbdf10c310efbb3b2676bbc0f8b08505c9e2f795',
  s: '021006b7838609339e8b415a7f9acb1b661828131aef1ecbc7955dfb01f3ca0e',
  q: '04779dd197a5df977ed2cf6cb31d82d43328b790dc6b3b7d4437a427bd5847dfcde94b724a555b6d017bb7607c3e3281daf5b1699d6ef4124975c9237b917d426f',
}*/

describe('XyoAccount', () => {
  test('Address from Phrase', () => {
    const wallet = Account.fromPhrase('test')
    expect(wallet.private).toHaveLength(32)
    expect(wallet.public).toHaveLength(64)
    expect(wallet.addressValue).toHaveLength(20)
    expect(wallet.private.hex).toEqual(testPrivateKey)
    expect(wallet.public.hex).toEqual(testPublicKey)
    expect(wallet.addressValue.hex).toEqual(testAddress)
  })

  test('Address from Key', () => {
    const wallet = Account.fromPrivateKey(testVectorPrivateKey)
    expect(wallet.private).toHaveLength(32)
    expect(wallet.public).toHaveLength(64)
    expect(wallet.addressValue).toHaveLength(20)
    expect(wallet.private.hex).toEqual(testVectorPrivateKey)
    expect(wallet.public.hex).toEqual(testVectorPublicKey)
    expect(wallet.addressValue.hex).toEqual(testVectorAddress)
  })

  test('Sign-fromPrivateKey', async () => {
    const wallet = Account.fromPrivateKey(testVectorPrivateKey)
    expect(wallet.public).toBeDefined()
    expect(wallet.addressValue.hex).toBeDefined()
    const signature = await wallet.sign(testVectorHash)
    const valid = wallet.verify(testVectorHash, signature)
    expect(valid).toBeTrue()
  })

  test('Sign-fromPhrase', async () => {
    const wallet = Account.fromPhrase('test')
    const signature = await wallet.sign(testVectorHash)
    const valid = wallet.verify(testVectorHash, signature)
    expect(valid).toBeTrue()
  })

  test('Sign-testVectors', async () => {
    const wallet = Account.fromPrivateKey(testVectorPrivateKey)
    const signature = Buffer.from(await wallet.sign(toUint8Array(testVectorHash))).toString('hex')
    const expectedSignature = testVectorSignature

    expect(signature).toEqual(expectedSignature)
    expect(signature.length).toEqual(128)
    const valid = wallet.verify(testVectorHash, signature)
    expect(valid).toBeTrue()
  })

  test('Constructor', () => {
    const wallet1 = new Account()
    const wallet2 = new Account({ privateKey: wallet1.private.bytes })
    expect(wallet1.public.hex).toEqual(wallet2.public.hex)
    expect(wallet1.addressValue.hex).toEqual(wallet2.addressValue.hex)
  })

  test('Sign-random-string', async () => {
    const wallet = Account.random()
    const signature = await wallet.sign(testVectorHash)
    const signaturePrime = toUint8Array(signature)
    expect(signature.length).toBe(signaturePrime.length)
    for (let i = 0; i < signature.length; i++) {
      expect(signature[i]).toBe(signaturePrime[i])
    }
    const valid = wallet.verify(testVectorHash, signature)
    expect(valid).toBeTrue()
  })

  describe('fromMnemonic', () => {
    const mnemonics = [
      'music snack noble scheme invest off disease pulp mountain sting present uncover steak visual bachelor wait please wreck dwarf lecture car excuse seminar educate',
      'another royal picture transfer yard point lecture carpet tonight sister diesel body yard clarify cream mom current margin unit fan ladder wisdom exercise feed',
      'quantum pumpkin robot candy doctor brass plate giggle squeeze vanish purpose depend',
      'satoshi cake access cannon feed source art oblige turtle perfect turtle dolphin',
      'food cream bacon divorce bring gravity employ taste hub fish tennis put',
    ]
    const paths = ['m/0/4', "m/44'/0'/0'", "m/44'/60'/0'/0/0", "m/44'/60'/0'/0/1", "m/49'/0'/0'", "m/84'/0'/0'", "m/84'/0'/0'/0"]
    it.each(mnemonics)('generates account from mnemonic', (mnemonic: string) => {
      const account = Account.fromMnemonic(mnemonic)
      expect(account).toBeObject()
      expect(account.addressValue.hex).toBeString()
    })
    it.each(paths)('generates account from mnemonic & path', (path: string) => {
      const account = Account.fromMnemonic(mnemonics[0], path)
      expect(account).toBeObject()
      expect(account.addressValue.hex).toBeString()
    })
  })
  describe('previousHash', () => {
    const hash = '3da33603417622f4cdad2becbca8c7889623d9045d0e8923e1702a99d2f3e47c'
    it('returns last signed hash', async () => {
      const account = Account.random()
      await account.sign(hash)
      expect(account.previousHash?.hex).toEqual(account.previousHash?.hex)
    })
    it('returns undefined if no previous signings', () => {
      const account = Account.random()
      expect(account.previousHash).toBeUndefined()
      expect(account.previousHash?.hex).toBeUndefined()
    })
    it('allows setting value via constructor', async () => {
      const accountA = Account.random()
      await accountA.sign(hash)
      const privateKey = accountA.private.hex
      const previousHash = accountA.previousHash?.hex
      const accountB = new Account({ privateKey, previousHash })
      expect(accountA.previousHash).toEqual(accountB.previousHash)
      expect(accountA.previousHash?.hex).toEqual(accountB.previousHash?.hex)
    })
    it('handles undefined value in constructor', () => {
      const account = new Account({ phrase: 'test', previousHash: undefined })
      expect(account.previousHash).toBeUndefined()
      expect(account.previousHash?.hex).toBeUndefined()
    })
  })
})
