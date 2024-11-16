import type { Address, Hex } from '@xylabs/hex'
import type { WalletInstance, WalletStatic } from '@xyo-network/wallet-model'
import {
  defaultPath, Mnemonic, SigningKey,
} from 'ethers'
import {
  describe, expect, it, test,
} from 'vitest'

import { HDWallet } from '../../HDWallet.ts'

/**
 * The wallet types that can be tested
 */
type Wallet = HDWallet | WalletInstance

/**
 * The serializable information of a wallet
 */
interface WalletSnapshot {
  address: Address
  path: string | null
  privateKey: Hex
  publicKey: Hex
}

/**
 * Converts a compressed public key to an uncompressed public key
 * @param compressed The compressed public key
 * @returns The uncompressed public key
 */
const toUncompressedPublicKey = (compressed: string): string => SigningKey.computePublicKey(compressed, false).toLowerCase().replace('0x04', '')

/**
 * Standardizes the representation of a hex string
 * @param unformatted The unformatted hex string
 * @returns The formatted hex string
 */
const formatHexString = (unformatted: string): string => unformatted.toLowerCase().replace('0x', '')

/**
 * Serializes a wallet to its snapshot representation
 * @param wallet The wallet to snapshot
 * @returns The snapshot representation of the wallet
 */
const toWalletSnapshot = (wallet: Wallet): WalletSnapshot => {
  const {
    address, path, privateKey, publicKey,
  } = wallet as WalletInstance
  return {
    address, path, privateKey, publicKey,
  }
}

/**
 * Snapshots the instances of two wallets to ensure repeatability
 * of creation from the same source and prevent unintentional changes
 * to the wallet protocol
 * @param walletA The first wallet to snapshot
 * @param walletB The second wallet to snapshot
 */
const snapshotWalletInstances = (walletA: Wallet, walletB: Wallet) => {
  expect([toWalletSnapshot(walletA), toWalletSnapshot(walletB)]).toMatchSnapshot()
}

/**
 * Compares two wallets to ensure their public/private keys are equal
 * @param sutA The first wallet to compare
 * @param sutB The second wallet to compare
 */
const expectWalletsEqual = (sutA: WalletInstance, sutB: Wallet) => {
  expect(sutA.address).toEqual(formatHexString(sutB.address))
  expect(sutA.privateKey).toEqual(sutB.privateKey)
  expect(sutA.private?.hex).toEqual(formatHexString(sutB.privateKey))
  expect(sutA.publicKey).toEqual(sutB.publicKey)
  expect(sutA.public?.hex).toEqual(toUncompressedPublicKey(sutB.publicKey))
}

/**
 * Compares two wallets to ensure their public/private keys and paths are equal
 * @param sutA The first wallet to compare
 * @param sutB The second wallet to compare
 */
const expectWalletsAndPathsEqual = (sutA: WalletInstance, sutB: Wallet) => {
  expectWalletsEqual(sutA, sutB)
  expect(sutA.path).toEqual(sutB.path)
}

/**
 * Generates tests for a wallet type
 * @param title The title of the test suite
 * @param HDWallet The wallet type to test
 */
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
        const sutB = await HDWallet.fromMnemonic(Mnemonic.fromPhrase(phrase))
        expectWalletsAndPathsEqual(sutA, sutB)
        snapshotWalletInstances(sutA, sutB)
        const accountA = await sutA.derivePath(path)
        const accountB = await sutB.derivePath(path)
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
        expect(sutB.path).not.toBeNull()
        snapshotWalletInstances(sutA, sutB)
        const accountA = await sutA.derivePath?.(path)
        const accountB = await sutB.derivePath?.(path)
        expectWalletsEqual(accountA, accountB)
        expect(accountA.path).not.toBeNull()
        expect(accountB.path).not.toBeNull()
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
  expect(typeof generateHDWalletTests).toBe('function')
})

test('Same address, two paths', async () => {
  const sut = await HDWallet.fromMnemonic(Mnemonic.fromPhrase('later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'))
  const accountNode = await sut.derivePath('0')
  expect(accountNode.path).toBe(`${defaultPath}/0`)
  const accountA = await sut.derivePath('0/2')
  const accountB = await accountNode.derivePath('2')
  const accountAPrime = await accountNode.derivePath("0'/2")
  const accountAPrime2 = await accountNode.derivePath("0/2'")
  expect(accountA.address).toEqual(accountB.address)
  expect(accountNode.address === accountB.address).toBe(false)
  expect(accountA.address === accountAPrime.address).toBe(false)
  expect(accountA.address === accountAPrime2.address).toBe(false)

  expect(accountNode.address).toMatchSnapshot()
  expect(accountA.address).toMatchSnapshot()
  expect(accountB.address).toMatchSnapshot()
  expect(accountAPrime.address).toMatchSnapshot()
})

test('Random Wallet', async () => {
  const sut = await HDWallet.random()
  expect(sut).toBeDefined()
  expect(sut.address).toBeDefined()
  expect(sut.privateKey).toBeDefined()
  expect(sut.publicKey).toBeDefined()
  expect(sut.extendedKey).toBeDefined()
  expect(sut.path).toBeDefined()
  expect(sut.path).toBe(defaultPath)
})

test('HDWallet can be created from mnemonic', async () => {
  const sut = await HDWallet.fromPhrase('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', "m/44'/0'/0'/0/0")
  expect(sut).toBeDefined()
  console.log('address', sut.privateKey)
})
