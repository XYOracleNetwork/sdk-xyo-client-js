import { XyoWalletBase } from './Base'

test('all', () => {
  const wallet = new XyoWalletBase('test phrase')
  const account = wallet.getAccount(10)

  expect(account).toBeDefined()
  expect(account.addressValue.length).toBe(20)
  expect(account.public.address.hex).toBe('8ce36d609316943d9825501eb88b1af1fe4586a0')
})
