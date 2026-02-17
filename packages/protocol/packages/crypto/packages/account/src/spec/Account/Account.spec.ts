import '@xylabs/vitest-extended'

import { isHex, toArrayBuffer } from '@xylabs/sdk-js'
import type { AccountInstance, AccountStatic } from '@xyo-network/account-model'
import {
  beforeAll,
  describe, expect, it, test,
} from 'vitest'

export const generateAccountTests = (title: string, Account: AccountStatic) => {
  // test vectors: https://tools.ietf.org/html/rfc8032
  // test tool: https://asecuritysite.com/encryption/ethadd

  const testVectorPrivateKey = '7f71bc5644f8f521f7e9b73f7a391e82c05432f8a9d36c44d6b1edbf1d8db62f'
  const testVectorPublicKey
    = 'ed6f3b86542f45aab88ec48ab1366b462bd993fec83e234054afd8f2311fba774800fdb40c04918463b463a6044b83413a604550bfba8f8911beb65475d6528e'
  const testVectorAddress = '5e7a847447e7fec41011ae7d32d768f86605ba03'
  const testVectorHash = toArrayBuffer('4b688df40bcedbe641ddb16ff0a1842d9c67ea1c3bf63f3e0471baa664531d1a')
  const testVectorSignature
    = 'b61dad551e910e2793b4f9f880125b5799086510ce102fad0222c1b093c60a6b38aa35ef56f97f86537269e8be95832aaa37d3b64d86b67f0cda467ac7cb5b3e'

  /* const testVectors = {
  d: 'ebb2c082fd7727890a28ac82f6bdf97bad8de9f5d7c9028692de1a255cad3e0f',
  k: '49a0d7b786ec9cde0d0721d72804befd06571c974b191efb42ecf322ba9ddd9a',
  h: '4b688df40bcedbe641ddb16ff0a1842d9c67ea1c3bf63f3e0471baa664531d1a',
  r: '241097efbf8b63bf145c8961dbdf10c310efbb3b2676bbc0f8b08505c9e2f795',
  s: '021006b7838609339e8b415a7f9acb1b661828131aef1ecbc7955dfb01f3ca0e',
  q: '04779dd197a5df977ed2cf6cb31d82d43328b790dc6b3b7d4437a427bd5847dfcde94b724a555b6d017bb7607c3e3281daf5b1699d6ef4124975c9237b917d426f',
} */

  describe(title, () => {
    test('Address from Key', async () => {
      console.log('privatekey', testVectorPrivateKey)
      const account = await Account.fromPrivateKey(testVectorPrivateKey)
      console.log('address', account.address)
      expect(account.private).toHaveLength(32)
      expect(account.public).toHaveLength(64)
      expect(account.addressBytes.byteLength).toBe(20)
      expect(account.private?.hex).toEqual(testVectorPrivateKey)
      expect(account.public?.hex).toEqual(testVectorPublicKey)
      expect(account.address).toEqual(testVectorAddress)
    })

    test('Address from Key (short bigint)', async () => {
      const i = 1n
      console.log('privatekey', i)
      const account = await Account.fromPrivateKey(i)
      console.log('address', account.address)
      expect(account.private).toHaveLength(32)
      expect(account.public).toHaveLength(64)
      expect(account.addressBytes.byteLength).toBe(20)
    })

    test('Sign-fromPrivateKey', async () => {
      const account = await Account.fromPrivateKey(testVectorPrivateKey)
      expect(account.public).toBeDefined()
      expect(account.address).toBeDefined()
      const previousHash = account.previousHash
      const [signature] = await account.sign(testVectorHash, toArrayBuffer(previousHash))
      const valid = await account.verify(testVectorHash, signature)
      expect(valid).toBeTrue()
    })

    test('Sign-testVectors', async () => {
      const account = await Account.fromPrivateKey(testVectorPrivateKey)
      const previousHash = account.previousHash
      const [signature] = await account.sign(testVectorHash, toArrayBuffer(previousHash))
      const expectedSignature = toArrayBuffer(testVectorSignature)

      expect(signature).toEqual(expectedSignature)
      expect(signature.byteLength).toEqual(64)
      const valid = await account.verify(testVectorHash, signature)
      expect(valid).toBeTrue()
    })

    test('Constructor', async () => {
      const account1 = await Account.fromPrivateKey(testVectorPrivateKey)
      expect(account1.private).toBeDefined()
      if (account1.private) {
        const account2 = await Account.create({ privateKey: account1.private.bytes })
        expect(account1.public).toBeDefined()
        expect(account2.public).toBeDefined()
        if (account1.public && account2.public) {
          expect(account1.public.hex).toEqual(account2.public.hex)
          expect(account1.address).toEqual(account2.address)
        }
      }
    })

    test('Sign-random-string', async () => {
      const account = await Account.fromPrivateKey(testVectorPrivateKey)
      const previousHash = account.previousHash
      const [signature] = await account.sign(testVectorHash, toArrayBuffer(previousHash))
      expect(signature.byteLength).toBe(64)
      const valid = await account.verify(testVectorHash, signature)
      expect(valid).toBeTrue()
    })

    describe('previousHash', () => {
      const hash = '3da33603417622f4cdad2becbca8c7889623d9045d0e8923e1702a99d2f3e47c'
      let account: AccountInstance
      beforeAll(async () => {
        account = await Account.create()
      })
      it('returns undefined if no previous signings', () => {
        expect(account.previousHash).toBeUndefined()
        expect(account.previousHash).toBeUndefined()
      })
      it('returns last signed hash', async () => {
        const previousHash = account.previousHash
        await account.sign(toArrayBuffer(hash), toArrayBuffer(previousHash))
        expect(account.previousHash).toEqual(account.previousHash)
      })
      it('allows setting value via constructor', async () => {
        const accountA = await Account.create()
        const oldPreviousHash = accountA.previousHash
        await accountA.sign(toArrayBuffer(hash), toArrayBuffer(oldPreviousHash))
        const privateKey = accountA.private?.hex
        expect(privateKey).toBeDefined()
        if (isHex(privateKey)) {
          const previousHash = accountA.previousHash
          expect(previousHash).toBeDefined()
          const accountB = await Account.create({ previousHash: toArrayBuffer(previousHash), privateKey: toArrayBuffer(privateKey) })
          expect(accountB.previousHash).toEqual(accountA.previousHash)
          expect(accountB.previousHash).toEqual(accountA.previousHash)
        }
      })
      /*
    it('handles undefined value in constructor', async () => {
      const account = await Account.create({ phrase: 'test', previousHash: undefined })
      expect(account.previousHash).toBeUndefined()
      expect(account.previousHash).toBeUndefined()
    })
    */
    })
  })
}

test('Account tests generator is defined', () => {
  expect(generateAccountTests).toBeFunction()
})
