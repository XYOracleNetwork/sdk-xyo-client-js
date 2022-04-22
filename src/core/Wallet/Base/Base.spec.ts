import { XyoWalletBase } from './Base'

test('all', () => {
  const wallet = new XyoWalletBase('test phrase')
  const account = wallet.getAccount(0)

  expect(account).toBeDefined()
  expect(account.addressValue.length).toBe(20)
})
