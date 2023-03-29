import { Provider } from '@ethersproject/providers'
import { XyoEthereumGasBlocknativeWitness, XyoEthereumGasBlocknativeWitnessConfigSchema } from '@xyo-network/blocknative-ethereum-gas-plugin'
import { XyoEtherchainEthereumGasWitnessV2, XyoEthereumGasEtherchainV2WitnessConfigSchema } from '@xyo-network/etherchain-ethereum-gas-v2-plugin'
import { XyoEthereumGasEthersWitness, XyoEthereumGasEthersWitnessConfigSchema } from '@xyo-network/ethers-ethereum-gas-plugin'
import { XyoEthereumGasEtherscanWitness, XyoEthereumGasEtherscanWitnessConfigSchema } from '@xyo-network/etherscan-ethereum-gas-plugin'
import { XyoEthereumGasEthgasstationWitness, XyoEthereumGasEthgasstationWitnessConfigSchema } from '@xyo-network/ethgasstation-ethereum-gas-plugin'
import { WitnessModule } from '@xyo-network/witness'

import { getAccount, WalletPaths } from '../Account'
import { canUseEtherscanProvider, getEtherscanProviderConfig, getProvider } from '../Providers'
import { WitnessProvider } from './WitnessProvider'

export const getEthereumGasWitness: WitnessProvider<Provider> = async (provider = getProvider()): Promise<WitnessModule[]> => {
  const witnesses: WitnessModule[] = [
    await XyoEthereumGasBlocknativeWitness.create({
      account: getAccount(WalletPaths.EthereumGasBlocknativeWitness),
      config: {
        schema: XyoEthereumGasBlocknativeWitnessConfigSchema,
      },
    }),
    await XyoEtherchainEthereumGasWitnessV2.create({
      account: getAccount(WalletPaths.EtherchainEthereumGasWitnessV2),
      config: {
        schema: XyoEthereumGasEtherchainV2WitnessConfigSchema,
      },
    }),
    await XyoEthereumGasEthersWitness.create({
      account: getAccount(WalletPaths.EthereumGasEthersWitness),
      config: {
        schema: XyoEthereumGasEthersWitnessConfigSchema,
      },
      provider,
    }),
    await XyoEthereumGasEthgasstationWitness.create({
      account: getAccount(WalletPaths.EthereumGasEthgasstationWitness),
      config: {
        schema: XyoEthereumGasEthgasstationWitnessConfigSchema,
      },
    }),
  ]
  if (canUseEtherscanProvider()) {
    const apiKey = getEtherscanProviderConfig()
    witnesses.push(
      await XyoEthereumGasEtherscanWitness.create({
        account: getAccount(WalletPaths.EtherscanEthereumGasWitness),
        config: {
          apiKey,
          schema: XyoEthereumGasEtherscanWitnessConfigSchema,
        },
      }),
    )
  }
  return witnesses
}
