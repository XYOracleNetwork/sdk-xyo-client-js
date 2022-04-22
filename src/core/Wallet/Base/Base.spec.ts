import { XyoWalletBase } from './Base'

test('all', () => {
  const wallet = new XyoWalletBase('test phrase')
  const account = wallet.getAccount(0)

  expect(account).toBeDefined()
  expect(account.addressValue.length).toBe(20)
  expect(account.public.address.hex).toBe('4185bb3c2f439fd36b40fcfd9114626d6c16c426')
})
