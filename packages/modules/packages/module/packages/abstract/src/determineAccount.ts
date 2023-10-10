/* eslint-disable max-lines */
import { assertEx } from '@xylabs/assert'
import { HDWallet } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { WalletInstance } from '@xyo-network/wallet-model'

export const determineAccount = async ({
  account,
  accountDerivationPath,
  wallet,
}: {
  account?: AccountInstance | 'random'
  accountDerivationPath?: string
  wallet?: WalletInstance
}): Promise<AccountInstance> => {
  if (wallet) {
    return assertEx(accountDerivationPath ? await wallet.derivePath(accountDerivationPath) : wallet, 'Failed to derive account from path')
  } else if (account === 'random') {
    return await HDWallet.random()
  } else if (account) {
    return account
  } else {
    //this should eventually be removed/thrown
    console.warn('AbstractModule.determineAccount: No account provided - Creating Random account')
    return await HDWallet.random()
  }
}
