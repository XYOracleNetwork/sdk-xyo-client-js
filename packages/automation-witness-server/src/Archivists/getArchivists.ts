import { assertEx } from '@xylabs/assert'
import { ApiConfig } from '@xyo-network/api-models'
import { ArchivistModule, isArchivistModule } from '@xyo-network/archivist-model'
import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'

import { getApiConfig } from './getApiConfig'

const schema = HttpBridgeConfigSchema
const security = { allowAnonymous: true }

export const getArchivists = async (configs: ApiConfig[] = [getApiConfig()]): Promise<ArchivistModule[]> => {
  const archivists: ArchivistModule[] = []
  for (let i = 0; i < configs.length; i++) {
    const nodeUrl = `${configs[i].apiDomain}/node`
    const bridge = await HttpBridge.create({ config: { nodeUrl, schema, security } })
    const modules = await bridge.downResolver.resolve({ name: ['Archivist'] })
    const mod = assertEx(modules.pop(), 'Error resolving Archivist')
    if (isArchivistModule(mod)) {
      archivists.push(mod)
    }
  }
  return archivists
}
