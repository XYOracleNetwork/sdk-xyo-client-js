import { XyoArchivistApi, XyoRemoteArchivist, XyoRemoteArchivistConfig, XyoRemoteArchivistConfigSchema } from '@xyo-network/api'
import { XyoApiConfig } from '@xyo-network/api-models'
import { PayloadArchivist } from '@xyo-network/archivist-interface'
import { AbstractModule } from '@xyo-network/module'

import { getApiConfig } from './getApiConfig'
import { getArchive } from './getArchive'

const schema = XyoRemoteArchivistConfigSchema

export const getArchivists = async (configs: XyoApiConfig[] = [getApiConfig()]): Promise<(PayloadArchivist & AbstractModule)[]> => {
  const archive = getArchive()
  const archivists: (PayloadArchivist & AbstractModule)[] = []
  for (let i = 0; i < configs.length; i++) {
    const apiConfig = configs[i]
    const config: XyoRemoteArchivistConfig = { api: new XyoArchivistApi(apiConfig), archive, schema }
    const archivist = await XyoRemoteArchivist.create({ config })
    archivists.push(archivist)
  }
  return archivists
}
