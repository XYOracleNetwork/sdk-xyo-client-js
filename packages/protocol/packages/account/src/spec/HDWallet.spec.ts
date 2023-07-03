import { WalletStatic } from '@xyo-network/wallet-model'

export const testHDAccount = (title: string, HDWallet: WalletStatic) => {
  describe(title, () => {
    const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
    describe('constructor', () => {
      it('can be created from mnemonic', async () => {
        const sut = await HDWallet.fromMnemonic(mnemonic)
        expect(sut).toBeDefined()
      })
    })
    describe('derivePath', () => {
      const paths = ['m/0/4', "m/44'/0'/0'", "m/44'/60'/0'/0/0", "m/44'/60'/0'/0/1", "m/49'/0'/0'", "m/84'/0'/0'", "m/84'/0'/0'/0"]
      it.each(paths)('works repeatably & interoperably', async (path: string) => {
        const sutA = await HDWallet.fromMnemonic(mnemonic)
        const sutB = await HDWallet.fromExtendedKey(sutA.extendedKey)
        const accountA = await sutA.derivePath?.(path)
        const accountB = await sutB.derivePath?.(path)
        expect(accountA.address).toBe(accountB.address)
        expect(accountA.private.hex).toBe(accountB.private.hex)
        expect(accountA.public.hex).toBe(accountB.public.hex)
      })
      it('works when paths provided incrementally', async () => {
        const parent = "44'/60'/0'"
        const child = '0/1'
        const sutA = await HDWallet.fromMnemonic(mnemonic)
        const sutB = await HDWallet.fromMnemonic(mnemonic)
        expect(sutA).toBe(sutB)
        const accountA = await (await sutA.derivePath(parent)).derivePath?.(child)
        const accountB = await sutB.derivePath?.([parent, child].join('/'))
        expect(accountA.address).toBe(accountB.address)
        expect(accountA.private.hex).toBe(accountB.private.hex)
        expect(accountA.public.hex).toBe(accountB.public.hex)
        expect(accountA).toEqual(accountB)
      })
      it('works when paths provided absolutely', async () => {
        const parent = "44'/60'/0'"
        const child = '0/1'
        const sutA = await HDWallet.fromMnemonic(mnemonic)
        const sutB = await HDWallet.fromMnemonic(mnemonic)
        expect(sutA).toBe(sutB)
        const accountA = await (await sutA.derivePath(parent)).derivePath?.(child)
        const accountB = await sutB.derivePath?.(['m', parent, child].join('/'))
        expect(accountA.address).toBe(accountB.address)
        expect(accountA.private.hex).toBe(accountB.private.hex)
        expect(accountA.public.hex).toBe(accountB.public.hex)
        expect(accountA).toEqual(accountB)
      })
      it('returns cached instances on subsequent requests', async () => {
        const parent = "44'/60'/0'"
        const child = '0/1'
        const sutA = await HDWallet.fromMnemonic(mnemonic)
        const sutB = await HDWallet.fromMnemonic(mnemonic)
        // sutA and sutB should be the same instance
        expect(sutA).toBe(sutB)
        const accountA = await (await sutA.derivePath(parent)).derivePath?.(child)
        const accountB = await sutB.derivePath?.([parent, child].join('/'))
        expect(accountA.address).toBe(accountB.address)
        expect(accountA.private.hex).toBe(accountB.private.hex)
        expect(accountA.public.hex).toBe(accountB.public.hex)
        // accountA and accountB should be the same instance
        expect(accountA).toBe(accountB)
      })
    })
  })
}

test('HDWallet tests generator is defined', () => {
  expect(testHDAccount).toBeFunction()
})
