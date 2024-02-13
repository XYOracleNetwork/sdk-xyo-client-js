import { WalletStatic } from '@xyo-network/wallet-model'
import { HDNodeWallet, Mnemonic, SigningKey } from 'ethers'

const toUncompressedPublicKey = (compressed: string): string => SigningKey.computePublicKey(compressed, false).toLowerCase().replace('0x04', '')

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
        expect(sutA.address).toEqual(sutB.address.toLowerCase().replace('0x', ''))
        expect(sutA.private.hex).toEqual(sutB.privateKey.toLowerCase().replace('0x', ''))
        expect(sutA.public.hex).toEqual(toUncompressedPublicKey(sutB.publicKey))
        expect(sutA.path).toEqual(sutB.path)
        const accountA = await sutA.derivePath(path)
        const accountB = sutB.derivePath(path)
        expect(accountA.address).toEqual(accountB.address.toLowerCase().replace('0x', ''))
        expect(accountA.private.hex).toEqual(accountB.privateKey.toLowerCase().replace('0x', ''))
        expect(accountA.public.hex).toEqual(toUncompressedPublicKey(accountB.publicKey))
        expect(accountA.path).toEqual(accountB.path)
      })
    })
    describe('derivePath', () => {
      it.each(paths)('works repeatably & interoperably from phrase & extended key', async (path: string) => {
        const sutA = await HDWallet.fromPhrase(phrase)
        const sutB = await HDWallet.fromExtendedKey(sutA.extendedKey)
        expect(sutB.path).toBeNull()
        const accountA = await sutA.derivePath?.(path)
        const accountB = await sutB.derivePath?.(path)
        expect(accountB.path).toBeNull()
        expect(accountA.address).toBe(accountB.address)
        expect(accountA.private.hex).toBe(accountB.private.hex)
        expect(accountA.public.hex).toBe(accountB.public.hex)
        expect(accountA.address).toMatchSnapshot()
        expect(accountB.address).toMatchSnapshot()
      })
      it('works when paths provided incrementally', async () => {
        const parentRelativePath = "44'/60'/0'"
        const childRelativePath = '0/1'
        const sutA = await HDWallet.fromPhrase(phrase)
        const sutB = await HDWallet.fromPhrase(phrase)
        expect(sutA.path).toEqual(sutB.path)
        const accountA = await (await sutA.derivePath(parentRelativePath)).derivePath?.(childRelativePath)
        const accountB = await sutB.derivePath?.([parentRelativePath, childRelativePath].join('/'))
        expect(accountA.address).toEqual(accountB.address)
        expect(accountA.private.hex).toEqual(accountB.private.hex)
        expect(accountA.public.hex).toEqual(accountB.public.hex)
        expect(accountA.path).toEqual(accountB.path)
        expect(accountA.address).toMatchSnapshot()
        expect(accountB.address).toMatchSnapshot()
      })
      it('works when paths provided absolutely', async () => {
        const parentAbsolutePath = "m/44'/60'/0'"
        const childRelativePath = '0/1'
        const absolutePath = [parentAbsolutePath, childRelativePath].join('/')
        const sutA = await HDWallet.fromPhrase(phrase, absolutePath)
        const sutB = await HDWallet.fromPhrase(phrase, parentAbsolutePath)
        expect(sutA.path).toEqual(absolutePath)
        expect(sutB.path).toEqual(parentAbsolutePath)
        const accountA = sutA
        const accountB = await sutB.derivePath(childRelativePath)
        expect(accountA.address).toEqual(accountB.address)
        expect(accountA.private.hex).toEqual(accountB.private.hex)
        expect(accountA.public.hex).toEqual(accountB.public.hex)
        expect(accountA.path).toEqual(accountB.path)
        // accountA and accountB should be the same instance
        // expect(accountA).toBe(accountB)
        expect(accountA.address).toMatchSnapshot()
        expect(accountB.address).toMatchSnapshot()
      })
      it('returns cached instances on subsequent requests', async () => {
        const parent = "44'/60'/0'"
        const child = '0/1'
        const sutA = await HDWallet.fromPhrase(phrase)
        const sutB = await HDWallet.fromPhrase(phrase)
        // sutA and sutB should be the same instance
        expect(sutA).toBe(sutB)
        const accountA = await (await sutA.derivePath(parent)).derivePath?.(child)
        const accountB = await sutB.derivePath?.([parent, child].join('/'))
        expect(accountA.address).toEqual(accountB.address)
        expect(accountA.private.hex).toEqual(accountB.private.hex)
        expect(accountA.public.hex).toEqual(accountB.public.hex)
        // accountA and accountB should be the same instance
        // expect(accountA).toBe(accountB)
      })
    })
  })
}

test('HDWallet tests generator is defined', () => {
  expect(generateHDWalletTests).toBeFunction()
})
