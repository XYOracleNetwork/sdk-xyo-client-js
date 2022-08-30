import { XyoWalletBase } from './Base'

test('all', () => {
  const wallet = new XyoWalletBase('test phrase')
  const account0 = wallet.getAccount(0)
  const account999999WithSalt = wallet.getAccount(999999, 'test')

  expect(account0).toBeDefined()
  expect(account0.addressValue.length).toBe(20)
  expect(account0.public.address.hex).toBe('130ec96d95076f8c521b408efb368bfdc57fc078')

  expect(account999999WithSalt).toBeDefined()
  expect(account999999WithSalt.addressValue.length).toBe(20)
  expect(account999999WithSalt.public.address.hex).toBe('7304f24bd4b24b7a78ed0f157b1e24d95dc3ed28')
})
