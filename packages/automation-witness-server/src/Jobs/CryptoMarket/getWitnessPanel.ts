import { AbstractModule, SimpleModuleResolver } from '@xyo-network/module'
import { XyoPanel, XyoPanelConfig, XyoPanelConfigSchema } from '@xyo-network/panel'

import { getAccount, WalletPaths } from '../../Account'
import { getArchivists } from '../../Archivists'
import { getProvider } from '../../Providers'
import { getCryptoMarketWitness } from '../../Witnesses'

/**
 * Static panel to prevent recreation/re-initialization of panel
 * dependencies each time
 */
let panel: XyoPanel | undefined = undefined

export const getWitnessPanel = async (provider = getProvider()): Promise<XyoPanel> => {
  const account = getAccount(WalletPaths.CryptoMarketWitnessPanel)
  const archivists = await getArchivists()
  const witnesses = await getCryptoMarketWitness(provider)
  const modules: AbstractModule[] = [...archivists, ...witnesses]
  const resolver: SimpleModuleResolver = new SimpleModuleResolver()
  modules.map((mod) => resolver.add(mod))
  const config: XyoPanelConfig = {
    archivists: archivists.map((mod) => mod.address),
    schema: XyoPanelConfigSchema,
    witnesses: witnesses.map((mod) => mod.address),
  }
  panel = await XyoPanel.create({ account, config, resolver })
  return panel
}
