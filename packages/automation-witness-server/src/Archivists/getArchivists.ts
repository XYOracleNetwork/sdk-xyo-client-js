import { HDWallet } from '@xyo-network/account'
import { ApiConfig } from '@xyo-network/api-models'
import { ArchivistInstance, asArchivistInstance, isArchivistModule } from '@xyo-network/archivist-model'
import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'

import { getApiConfig } from './getApiConfig'

const schema = HttpBridgeConfigSchema
const security = { allowAnonymous: true }

export const getArchivists = async (configs: ApiConfig[] = [getApiConfig()]): Promise<ArchivistInstance[]> => {
  const archivists: ArchivistInstance[] = []
  for (let i = 0; i < configs.length; i++) {
    const nodeUrl = `${configs[i].apiDomain}/node`
    const bridge = await HttpBridge.create({ account: await HDWallet.random(), config: { nodeUrl, schema, security } })
    const modules = await bridge.resolve({ name: ['Archivist'] })
    const mod = asArchivistInstance(modules.pop(), 'Error resolving Archivist')
    if (isArchivistModule(mod)) {
      archivists.push(mod)
    }
  }
  return archivists
}
