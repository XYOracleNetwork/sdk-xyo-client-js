import { CompositeModuleResolver, Module } from '@xyo-network/module'
import { AbstractSentinel, SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel'

import { getAccount, WalletPaths } from '../../Account'
import { getArchivists } from '../../Archivists'
import { getProvider } from '../../Providers'
import { getEthereumGasWitness } from '../../Witnesses'

export const getWitnessPanel = async (provider = getProvider()): Promise<AbstractSentinel> => {
  const account = getAccount(WalletPaths.EthereumGasWitnessPanel)
  const archivists = await getArchivists()
  const witnesses = await getEthereumGasWitness(provider)
  const modules: Module[] = [...archivists, ...witnesses]
  const resolver = new CompositeModuleResolver()
  modules.map((mod) => resolver.add(mod))
  const config: SentinelConfig = {
    archivists: archivists.map((mod) => mod.address),
    schema: SentinelConfigSchema,
    witnesses: witnesses.map((mod) => mod.address),
  }
  return await AbstractSentinel.create({ account, config, resolver })
}
