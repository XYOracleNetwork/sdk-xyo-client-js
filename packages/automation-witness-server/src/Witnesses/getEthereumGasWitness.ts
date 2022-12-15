import { Provider } from '@ethersproject/providers'
import { XyoEthereumGasBlocknativeWitness, XyoEthereumGasBlocknativeWitnessConfigSchema } from '@xyo-network/blocknative-ethereum-gas-plugin'
import { XyoEtherchainEthereumGasWitnessV1, XyoEthereumGasEtherchainV1WitnessConfigSchema } from '@xyo-network/etherchain-ethereum-gas-v1-plugin'
import { XyoEtherchainEthereumGasWitnessV2, XyoEthereumGasEtherchainV2WitnessConfigSchema } from '@xyo-network/etherchain-ethereum-gas-v2-plugin'
import { XyoEthereumGasEthersWitness, XyoEthereumGasEthersWitnessConfigSchema } from '@xyo-network/ethers-ethereum-gas-plugin'
import { XyoEthereumGasEtherscanWitness, XyoEthereumGasEtherscanWitnessConfigSchema } from '@xyo-network/etherscan-ethereum-gas-plugin'
import { XyoEthereumGasEthgasstationWitness, XyoEthereumGasEthgasstationWitnessConfigSchema } from '@xyo-network/ethgasstation-ethereum-gas-plugin'
import { AbstractWitness } from '@xyo-network/witness'

import { getAccount, WalletPaths } from '../Account'
import { canUseEtherscanProvider, getEtherscanProviderConfig, getProvider } from '../Providers'
import { WitnessProvider } from './WitnessProvider'

export const getEthereumGasWitness: WitnessProvider<Provider> = async (provider = getProvider()): Promise<AbstractWitness[]> => {
  const witnesses: AbstractWitness[] = [
    await XyoEthereumGasBlocknativeWitness.create({
      account: getAccount(WalletPaths.XyoEthereumGasBlocknativeWitness),
      config: {
        schema: XyoEthereumGasBlocknativeWitnessConfigSchema,
      },
    }),
    await XyoEtherchainEthereumGasWitnessV1.create({
      account: getAccount(WalletPaths.XyoEtherchainEthereumGasWitnessV1),
      config: {
        schema: XyoEthereumGasEtherchainV1WitnessConfigSchema,
      },
    }),
    await XyoEtherchainEthereumGasWitnessV2.create({
      account: getAccount(WalletPaths.XyoEtherchainEthereumGasWitnessV2),
      config: {
        schema: XyoEthereumGasEtherchainV2WitnessConfigSchema,
      },
    }),
    await XyoEthereumGasEthersWitness.create({
      account: getAccount(WalletPaths.XyoEthereumGasEthersWitness),
      config: {
        schema: XyoEthereumGasEthersWitnessConfigSchema,
      },
      provider,
    }),
    await XyoEthereumGasEthgasstationWitness.create({
      account: getAccount(WalletPaths.XyoEthereumGasEthgasstationWitness),
      config: {
        schema: XyoEthereumGasEthgasstationWitnessConfigSchema,
      },
    }),
  ]
  if (canUseEtherscanProvider()) {
    const apiKey = getEtherscanProviderConfig()
    witnesses.push(
      await XyoEthereumGasEtherscanWitness.create({
        account: getAccount(WalletPaths.XyoEtherscanEthereumGasWitness),
        config: {
          apiKey,
          schema: XyoEthereumGasEtherscanWitnessConfigSchema,
        },
      }),
    )
  }
  return witnesses
}
