import { Provider } from '@ethersproject/providers'
import { EthereumGasBlocknativeWitness, EthereumGasBlocknativeWitnessConfigSchema } from '@xyo-network/blocknative-ethereum-gas-plugin'
import { EtherchainEthereumGasWitnessV2, EthereumGasEtherchainV2WitnessConfigSchema } from '@xyo-network/etherchain-ethereum-gas-v2-plugin'
import { EthereumGasEthersWitness, EthereumGasEthersWitnessConfigSchema } from '@xyo-network/ethers-ethereum-gas-plugin'
import { EthereumGasEtherscanWitness, EthereumGasEtherscanWitnessConfigSchema } from '@xyo-network/etherscan-ethereum-gas-plugin'
import { EthereumGasEthgasstationWitness, EthereumGasEthgasstationWitnessConfigSchema } from '@xyo-network/ethgasstation-ethereum-gas-plugin'
import { WitnessModule } from '@xyo-network/witness'

import { getAccount, WalletPaths } from '../Account'
import { canUseEtherscanProvider, getEtherscanProviderConfig, getProvider } from '../Providers'
import { WitnessProvider } from './WitnessProvider'

export const getEthereumGasWitness: WitnessProvider<Provider> = async (provider = getProvider()): Promise<WitnessModule[]> => {
  const witnesses: WitnessModule[] = [
    await EthereumGasBlocknativeWitness.create({
      account: getAccount(WalletPaths.EthereumGas.Witness.Blocknative),
      config: {
        schema: EthereumGasBlocknativeWitnessConfigSchema,
      },
    }),
    await EtherchainEthereumGasWitnessV2.create({
      account: getAccount(WalletPaths.EthereumGas.Witness.EtherchainV2),
      config: {
        schema: EthereumGasEtherchainV2WitnessConfigSchema,
      },
    }),
    await EthereumGasEthersWitness.create({
      account: getAccount(WalletPaths.EthereumGas.Witness.Ethers),
      config: {
        schema: EthereumGasEthersWitnessConfigSchema,
      },
      provider,
    }),
    await EthereumGasEthgasstationWitness.create({
      account: getAccount(WalletPaths.EthereumGas.Witness.Ethgasstation),
      config: {
        schema: EthereumGasEthgasstationWitnessConfigSchema,
      },
    }),
  ]
  if (canUseEtherscanProvider()) {
    const apiKey = getEtherscanProviderConfig()
    witnesses.push(
      await EthereumGasEtherscanWitness.create({
        account: getAccount(WalletPaths.EthereumGas.Witness.Etherscan),
        config: {
          apiKey,
          schema: EthereumGasEtherscanWitnessConfigSchema,
        },
      }),
    )
  }
  return witnesses
}
