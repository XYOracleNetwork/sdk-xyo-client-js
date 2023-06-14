import {WebWallet } from '../Web'

test('all', () => {
  const wallet = newWebWallet('test phrase')
  const account = wallet.getAccount(5)

  expect(account).toBeDefined()
  expect(account.addressValue.length).toBe(20)
})
