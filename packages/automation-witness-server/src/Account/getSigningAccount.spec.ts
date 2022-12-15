import { getSigningAccount } from './getSigningAccount'

describe('getSigningAccount', () => {
  it('returns the signing account specified by the phrase supplied', () => {
    const signingAccount = getSigningAccount('test')
    expect(signingAccount).toBeTruthy()
    expect(signingAccount.addressValue.hex).toBeTruthy()
  })
  it('returns the signing account specified by the ENV if no phrase supplied', () => {
    const signingAccount = getSigningAccount()
    expect(signingAccount).toBeTruthy()
    expect(signingAccount.addressValue.hex).toBeTruthy()
  })
})
