import { assertEx } from '@xylabs/assert'
import { XyoApiConfig } from '@xyo-network/api-models'
import { ArchivistModule } from '@xyo-network/archivist-model'
import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { ArchivistWrapper } from '@xyo-network/modules'

import { getApiConfig } from './getApiConfig'

const bridges: Record<string, HttpBridge> = {}
const schema = HttpBridgeConfigSchema
const security = { allowAnonymous: true }

export const getArchivists = async (configs: XyoApiConfig[] = [getApiConfig()]): Promise<ArchivistModule[]> => {
  const archivists: ArchivistModule[] = []
  for (let i = 0; i < configs.length; i++) {
    const nodeUrl = `${configs[i].apiDomain}/node`
    const bridge = bridges[nodeUrl] || (await HttpBridge.create({ config: { nodeUrl, schema, security } }))
    bridges[nodeUrl] = bridge
    const modules = await bridge.downResolver.resolve({ name: ['Archivist'] })
    const mod = assertEx(modules.pop(), 'Error resolving Archivist')
    const archivist = ArchivistWrapper.wrap(mod)
    archivists.push(archivist.module)
  }
  return archivists
}
