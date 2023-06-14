import { WebWallet } from '../Web'

test('all', () => {
  const wallet = new WebWallet('test phrase')
  const account = wallet.getAccount(5)

  expect(account).toBeDefined()
  expect(account.addressValue.length).toBe(20)
})
