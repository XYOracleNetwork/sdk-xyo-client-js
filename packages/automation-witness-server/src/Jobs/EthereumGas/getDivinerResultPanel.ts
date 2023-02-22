import { CompositeModuleResolver, Module } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractSentinel, SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel'
import { XyoAdhocWitness, XyoAdhocWitnessConfig, XyoAdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { getAccount, WalletPaths } from '../../Account'
import { getArchivists } from '../../Archivists'

export const getDivinerResultPanel = async (result: XyoPayload): Promise<AbstractSentinel> => {
  const account = getAccount(WalletPaths.EthereumGasDivinerResultPanel)
  const archivists = await getArchivists()
  const witnessConfig: XyoAdhocWitnessConfig = { payload: result, schema: XyoAdhocWitnessConfigSchema }
  const witnesses = [await XyoAdhocWitness.create({ account, config: witnessConfig })]
  const modules: Module[] = [...archivists, ...witnesses]
  const resolver = new CompositeModuleResolver()
  modules.map((mod) => resolver.add(mod))
  const panelConfig: SentinelConfig = {
    archivists: archivists.map((mod) => mod.address),
    schema: SentinelConfigSchema,
    witnesses: witnesses.map((mod) => mod.address),
  }
  return await AbstractSentinel.create({ account, config: panelConfig, resolver })
}
