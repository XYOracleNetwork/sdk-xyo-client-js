import { WebWallet } from '../Web'

test('all', async () => {
  const wallet = new WebWallet('test phrase')
  const account = await wallet.getAccount(5)

  expect(account).toBeDefined()
  expect(account.addressValue.length).toBe(20)
})
