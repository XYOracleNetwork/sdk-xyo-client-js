import { AbstractModule, SimpleModuleResolver } from '@xyo-network/module'
import { XyoPanel, XyoPanelConfig, XyoPanelConfigSchema } from '@xyo-network/panel'
import { XyoPayload } from '@xyo-network/payload'
import { XyoAdhocWitness, XyoAdhocWitnessConfig, XyoAdhocWitnessConfigSchema } from '@xyo-network/witnesses'

import { getAccount, WalletPaths } from '../../Account'
import { getArchivists } from '../../Archivists'

export const getDivinerResultPanel = async (result: XyoPayload): Promise<XyoPanel> => {
  const account = getAccount(WalletPaths.EthereumGasDivinerResultPanel)
  const archivists = await getArchivists()
  const witnessConfig: XyoAdhocWitnessConfig = { payload: result, schema: XyoAdhocWitnessConfigSchema }
  const witnesses = [await XyoAdhocWitness.create({ account, config: witnessConfig })]
  const modules: AbstractModule[] = [...archivists, ...witnesses]
  const resolver = new SimpleModuleResolver()
  modules.map((mod) => resolver.add(mod))
  const panelConfig: XyoPanelConfig = {
    archivists: archivists.map((mod) => mod.address),
    schema: XyoPanelConfigSchema,
    witnesses: witnesses.map((mod) => mod.address),
  }
  return await XyoPanel.create({ account, config: panelConfig, resolver })
}
