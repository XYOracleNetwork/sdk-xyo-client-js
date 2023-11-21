import { EthereumGasBlocknativeWitness, EthereumGasBlocknativeWitnessConfigSchema } from '@xyo-network/blocknative-ethereum-gas-plugin'
import { EtherchainEthereumGasWitnessV2, EthereumGasEtherchainV2WitnessConfigSchema } from '@xyo-network/etherchain-ethereum-gas-v2-plugin'
import { EthereumGasEthersWitness, EthereumGasEthersWitnessConfigSchema } from '@xyo-network/ethers-ethereum-gas-plugin'
import { EthereumGasEtherscanWitness, EthereumGasEtherscanWitnessConfigSchema } from '@xyo-network/etherscan-ethereum-gas-plugin'
import { WitnessInstance } from '@xyo-network/witness-model'
import { Provider } from 'ethers'

import { getAccount, WalletPaths } from '../Account'
import { canUseEtherscanProvider, getEtherscanProviderConfig, getProvider } from '../Providers'
import { WitnessProvider } from './WitnessProvider'

export const getEthereumGasWitness: WitnessProvider<Provider> = async (provider = getProvider()): Promise<WitnessInstance[]> => {
  const witnesses: WitnessInstance[] = [
    await EthereumGasBlocknativeWitness.create({
      account: await getAccount(WalletPaths.EthereumGas.Witness.Blocknative),
      config: {
        schema: EthereumGasBlocknativeWitnessConfigSchema,
      },
    }),
    await EtherchainEthereumGasWitnessV2.create({
      account: await getAccount(WalletPaths.EthereumGas.Witness.EtherchainV2),
      config: {
        schema: EthereumGasEtherchainV2WitnessConfigSchema,
      },
    }),
    await EthereumGasEthersWitness.create({
      account: await getAccount(WalletPaths.EthereumGas.Witness.Ethers),
      config: {
        schema: EthereumGasEthersWitnessConfigSchema,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      provider: provider as any,
    }),
  ]
  if (canUseEtherscanProvider()) {
    const apiKey = getEtherscanProviderConfig()
    witnesses.push(
      await EthereumGasEtherscanWitness.create({
        account: await getAccount(WalletPaths.EthereumGas.Witness.Etherscan),
        config: {
          apiKey,
          schema: EthereumGasEtherscanWitnessConfigSchema,
        },
      }),
    )
  }
  return witnesses
}
