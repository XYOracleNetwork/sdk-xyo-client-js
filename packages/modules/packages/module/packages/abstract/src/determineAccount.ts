/* eslint-disable max-lines */
import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { WalletInstance } from '@xyo-network/wallet-model'

export interface DetermineAccountFromAccountParams {
  account: AccountInstance | 'random'
}

export interface DetermineAccountFromWalletParams {
  accountDerivationPath?: string
  wallet: WalletInstance
}

export interface DetermineRandomParams {}

export type DetermineAccountParams = DetermineAccountFromAccountParams | DetermineAccountFromWalletParams | DetermineRandomParams

const isDetermineAccountFromAccountParams = (params: DetermineAccountParams): params is DetermineAccountFromAccountParams => {
  assertEx(!(params as DetermineAccountFromWalletParams).accountDerivationPath, 'accountDerivationPath may not be provided when account is provided')
  return !!(params as DetermineAccountFromAccountParams).account
}

const isDetermineAccountFromWalletParams = (params: DetermineAccountParams): params is DetermineAccountFromWalletParams => {
  return !!(params as DetermineAccountFromWalletParams).wallet
}

export async function determineAccount(params: DetermineAccountParams): Promise<AccountInstance> {
  if (isDetermineAccountFromAccountParams(params)) {
    return params.account === 'random' ? Account.randomSync() : params.account
  }

  if (isDetermineAccountFromWalletParams(params)) {
    return assertEx(
      params.accountDerivationPath ? await params.wallet.derivePath(params.accountDerivationPath) : params.wallet,
      'Failed to derive account from path',
    )
  }

  //this should eventually be removed/thrown
  console.warn('AbstractModule.determineAccount: No account or wallet provided - Creating Random account')
  return Account.randomSync()
}
