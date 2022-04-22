import { XyoWebWallet } from './Web'

test('all', () => {
  const wallet = new XyoWebWallet('test phrase')
  const account = wallet.getAccount(0)

  expect(account).toBeDefined()
  expect(account.addressValue.length).toBe(20)
})
