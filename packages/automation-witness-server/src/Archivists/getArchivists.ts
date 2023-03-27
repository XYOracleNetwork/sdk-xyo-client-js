import { assertEx } from '@xylabs/assert'
import { XyoApiConfig } from '@xyo-network/api-models'
import { ArchivistModule } from '@xyo-network/archivist-model'
import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { ArchivistWrapper } from '@xyo-network/modules'

import { getApiConfig } from './getApiConfig'

export const getArchivists = async (configs: XyoApiConfig[] = [getApiConfig()]): Promise<ArchivistModule[]> => {
  const archivists: ArchivistModule[] = []
  for (let i = 0; i < configs.length; i++) {
    const nodeUri = configs[i].apiDomain
    const bridge = await HttpBridge.create({
      config: { nodeUrl: `${nodeUri}/node`, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })
    const modules = await bridge.downResolver.resolve({ name: ['Archivist'] })
    const mod = assertEx(modules.pop(), 'Error resolving Archivist')
    const archivist = ArchivistWrapper.wrap(mod)
    archivists.push(archivist.module)
  }
  return archivists
}
