import { WalletInstance, WalletStatic } from '@xyo-network/wallet-model'
import { HDNodeWallet, Mnemonic, SigningKey } from 'ethers'

type Wallet = HDNodeWallet | WalletInstance
interface WalletSnapshot {
  address: string
  path: string | null
  privateKey: string
  publicKey: string
}

/**
 * Converts a compressed public key to an uncompressed public key
 * @param compressed The compressed public key
 * @returns The uncompressed public key
 */
const toUncompressedPublicKey = (compressed: string): string => SigningKey.computePublicKey(compressed, false).toLowerCase().replace('0x04', '')

const formatHexString = (unformatted: string): string => unformatted.toLowerCase().replace('0x', '')

const toWalletSnapshot = (wallet: Wallet): WalletSnapshot => {
  const { address, path, privateKey, publicKey } = wallet
  return { address, path, privateKey, publicKey }
}

const snapshotWalletInstances = (walletA: Wallet, walletB: Wallet) => {
  expect([toWalletSnapshot(walletA), toWalletSnapshot(walletB)]).toMatchSnapshot()
}

const expectWalletsEqual = (sutA: WalletInstance, sutB: Wallet) => {
  expect(sutA.address).toEqual(formatHexString(sutB.address))
  expect(sutA.privateKey).toEqual(sutB.privateKey)
  expect(sutA.private.hex).toEqual(formatHexString(sutB.privateKey))
  expect(sutA.publicKey).toEqual(sutB.publicKey)
  expect(sutA.public.hex).toEqual(toUncompressedPublicKey(sutB.publicKey))
}

const expectWalletsAndPathsEqual = (sutA: WalletInstance, sutB: Wallet) => {
  expectWalletsEqual(sutA, sutB)
  expect(sutA.path).toEqual(sutB.path)
}

export const generateHDWalletTests = (title: string, HDWallet: WalletStatic) => {
  describe(title, () => {
    const phrase = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
    const paths = ['0/4', "44'/0'/0'", "44'/60'/0'/0/0", "44'/60'/0'/0/1", "49'/0'/0'", "84'/0'/0'", "84'/0'/0'/0"]

    describe('constructor', () => {
      it('can be created from mnemonic', async () => {
        const sut = await HDWallet.fromPhrase(phrase)
        expect(sut).toBeDefined()
      })
      it.each(paths)('works repeatably & interoperably with Ethers', async (path: string) => {
        const sutA = await HDWallet.fromPhrase(phrase)
        const sutB = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(phrase))
        expectWalletsAndPathsEqual(sutA, sutB)
        snapshotWalletInstances(sutA, sutB)
        const accountA = await sutA.derivePath(path)
        const accountB = sutB.derivePath(path)
        expectWalletsAndPathsEqual(accountA, accountB)
        snapshotWalletInstances(accountA, accountB)
      })
    })
    describe('derivePath', () => {
      it.each(paths)('works repeatably & interoperably from phrase & extended key', async (path: string) => {
        const sutA = await HDWallet.fromPhrase(phrase)
        const sutB = await HDWallet.fromExtendedKey(sutA.extendedKey)
        expectWalletsEqual(sutA, sutB)
        expect(sutA.path).not.toBeNull()
        expect(sutB.path).toBeNull()
        snapshotWalletInstances(sutA, sutB)
        const accountA = await sutA.derivePath?.(path)
        const accountB = await sutB.derivePath?.(path)
        expectWalletsEqual(accountA, accountB)
        expect(accountA.path).not.toBeNull()
        expect(accountB.path).toBeNull()
        snapshotWalletInstances(accountA, accountB)
      })
      it('works when paths provided incrementally', async () => {
        const parentRelativePath = "44'/60'/0'"
        const childRelativePath = '0/1'
        const sutA = await HDWallet.fromPhrase(phrase)
        const sutB = await HDWallet.fromPhrase(phrase)
        expectWalletsAndPathsEqual(sutA, sutB)
        snapshotWalletInstances(sutA, sutB)
        const accountA = await (await sutA.derivePath(parentRelativePath)).derivePath?.(childRelativePath)
        const accountB = await sutB.derivePath?.([parentRelativePath, childRelativePath].join('/'))
        expectWalletsAndPathsEqual(accountA, accountB)
        snapshotWalletInstances(accountA, accountB)
      })
      it('works when paths provided absolutely', async () => {
        const parentAbsolutePath = "m/44'/60'/0'"
        const childRelativePath = '0/1'
        const absolutePath = [parentAbsolutePath, childRelativePath].join('/')
        const sutA = await HDWallet.fromPhrase(phrase, absolutePath)
        const sutB = await HDWallet.fromPhrase(phrase, parentAbsolutePath)
        expect(sutA.path).toEqual(absolutePath)
        expect(sutB.path).toEqual(parentAbsolutePath)
        // Skip intermediate snapshot since wallets currently have different paths
        // snapshotWalletInstances(sutA, sutB)
        const accountA = sutA
        const accountB = await sutB.derivePath(childRelativePath)
        expectWalletsAndPathsEqual(accountA, accountB)
        // accountA and accountB should be the same instance
        // expect(accountA).toBe(accountB)
        snapshotWalletInstances(accountA, accountB)
      })
      it('returns cached instances on subsequent requests', async () => {
        const parent = "44'/60'/0'"
        const child = '0/1'
        const sutA = await HDWallet.fromPhrase(phrase)
        const sutB = await HDWallet.fromPhrase(phrase)
        expectWalletsAndPathsEqual(sutA, sutB)
        // sutA and sutB should be the same instance
        expect(sutA).toBe(sutB)
        const accountA = await (await sutA.derivePath(parent)).derivePath?.(child)
        const accountB = await sutB.derivePath?.([parent, child].join('/'))
        expectWalletsAndPathsEqual(accountA, accountB)
        // accountA and accountB should be the same instance
        // expect(accountA).toBe(accountB)
        snapshotWalletInstances(accountA, accountB)
      })
    })
  })
}

test('HDWallet tests generator is defined', () => {
  expect(generateHDWalletTests).toBeFunction()
})
