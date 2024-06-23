import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { WalletInstance } from '@xyo-network/wallet-model'

export interface DetermineAccountFromAccountParams {
  account: AccountInstance | 'random'
}

export interface DetermineAccountFromWalletParams {
  accountPath?: string
  wallet: WalletInstance
}

export interface DetermineRandomParams {}

export type DetermineAccountParams = DetermineAccountFromAccountParams | DetermineAccountFromWalletParams | DetermineRandomParams

const isDetermineAccountFromAccountParams = (params: DetermineAccountParams): params is DetermineAccountFromAccountParams => {
  assertEx(!(params as DetermineAccountFromWalletParams).accountPath, () => 'accountPath may not be provided when account is provided')
  return !!(params as DetermineAccountFromAccountParams).account
}

const isDetermineAccountFromWalletParams = (params: DetermineAccountParams): params is DetermineAccountFromWalletParams => {
  return !!(params as DetermineAccountFromWalletParams).wallet
}

export async function determineAccount(params: DetermineAccountParams, allowRandomAccount = true): Promise<AccountInstance> {
  if (isDetermineAccountFromAccountParams(params)) {
    if (params.account === 'random') {
      assertEx(allowRandomAccount, () => 'Random address not allowed')
      return Account.randomSync()
    }
    return params.account
  }

  if (isDetermineAccountFromWalletParams(params)) {
    return assertEx(
      params.accountPath ? await params.wallet.derivePath(params.accountPath) : params.wallet,
      () => 'Failed to derive account from path',
    )
  }

  //this should eventually be removed/thrown
  console.warn('AbstractModule.determineAccount: No account or wallet provided - Creating Random account')
  return Account.randomSync()
}
