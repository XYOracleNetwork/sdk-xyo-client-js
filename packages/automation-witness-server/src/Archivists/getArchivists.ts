import { XyoApiConfig } from '@xyo-network/api-models'
import { ArchivistModule } from '@xyo-network/archivist-interface'

import { getApiConfig } from './getApiConfig'
import { getArchive } from './getArchive'

export const getArchivists = async (configs: XyoApiConfig[] = [getApiConfig()]): Promise<ArchivistModule[]> => {
  const archive = getArchive()
  const archivists: ArchivistModule[] = []
  await Promise.resolve()
  // const bridge = await HttpBridge.create({
  //   axios: new AxiosJson(),
  //   config: { nodeUri: `${nodeUri}/node`, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
  // })
  for (let i = 0; i < configs.length; i++) {
    // archivists.push(archivist)
    // TODO:
    // const [archivistByName] = await NodeWrapper.wrap(memNode).resolve({ name: ['Archivist'] })
  }
  return archivists
}
