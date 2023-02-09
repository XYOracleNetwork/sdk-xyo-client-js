import { arrayify } from '@ethersproject/bytes'
import { HDNode, mnemonicToSeed } from '@ethersproject/hdnode'
import { computeHmac, SupportedAlgorithm } from '@ethersproject/sha2'
import { toUtf8Bytes } from '@ethersproject/strings'
import { Account } from '@xyo-network/account'

import { fromMnemonic } from './HdWallet'

// "Bitcoin seed"
const MasterSecret = toUtf8Bytes('Bitcoin seed')

const mnemonics = [
  'music snack noble scheme invest off disease pulp mountain sting present uncover steak visual bachelor wait please wreck dwarf lecture car excuse seminar educate',
  'another royal picture transfer yard point lecture carpet tonight sister diesel body yard clarify cream mom current margin unit fan ladder wisdom exercise feed',
  'quantum pumpkin robot candy doctor brass plate giggle squeeze vanish purpose depend',
  'satoshi cake access cannon feed source art oblige turtle perfect turtle dolphin',
  'food cream bacon divorce bring gravity employ taste hub fish tennis put',
]
const mnemonic = mnemonics[0]

const paths = ['m/0/4', "m/44'/0'/0'", "m/44'/60'/0'/0/0", "m/44'/60'/0'/0/1", "m/49'/0'/0'", "m/84'/0'/0'", "m/84'/0'/0'/0"]

describe('HD Wallet', () => {
  describe('is compatible with XyoAccount', () => {
    describe('parent', () => {
      it.each(mnemonics)('public address is equal to XyoAccount', () => {
        // Create HD Wallet from mnemonic
        const hdNode = HDNode.fromMnemonic(mnemonic)
        expect(hdNode).toBeObject()

        // Create XyoAccount from mnemonic private key
        const seed = mnemonicToSeed(mnemonic)
        const seedArray: Uint8Array = arrayify(seed)
        const hmac: Uint8Array = arrayify(computeHmac(SupportedAlgorithm.sha512, MasterSecret, seedArray))
        const privateKey = hmac.slice(0, 32)
        const account = new Account({ privateKey })
        expect(account).toBeObject()

        // Compare public addresses from both for equivalence
        const hdWalletAddress = hdNode.address.toLowerCase().replace('0x', '')
        const xyoWalletAddress = account.addressValue.hex.toLowerCase().replace('0x', '')
        expect(hdWalletAddress).toEqual(xyoWalletAddress)
      })
    })
    describe('child', () => {
      it.each(paths)('public address is equal to XyoAccount for path %s', (path: string) => {
        const parent = HDNode.fromMnemonic(mnemonic)
        const child = parent.derivePath(path)
        expect(child).toBeObject()
        expect(child.privateKey).toBeString()

        const privateKey = child.privateKey.toLowerCase().replace('0x', '')
        const account = new Account({ privateKey })

        // Compare public addresses from both for equivalence
        const hdWalletAddress = child.address.toLowerCase().replace('0x', '')
        const xyoWalletAddress = account.addressValue.hex.toLowerCase().replace('0x', '')
        expect(hdWalletAddress).toEqual(xyoWalletAddress)
      })
    })
    describe('relationship', () => {
      it.skip('can determine parent', () => {
        const parent = HDNode.fromMnemonic(mnemonic)
        const child = parent.derivePath('m/0/0')
        expect(child).toBeObject()
        // TODO: Check that child is child of parent
      })
    })
  })
  describe('fromMnemonic', () => {
    it.each(mnemonics)('generates account from mnemonic', (mnemonic: string) => {
      const account = fromMnemonic(mnemonic)
      expect(account).toBeObject()
      expect(account.addressValue.hex).toBeString()
    })
    it.each(paths)('generates account from mnemonic & phrase', (phrase: string) => {
      const account = fromMnemonic(mnemonic, phrase)
      expect(account).toBeObject()
      expect(account.addressValue.hex).toBeString()
    })
  })
})
