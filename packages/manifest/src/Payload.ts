import { ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type ManifestPayloadSchema = 'network.xyo.manifest'
export const ManifestPayloadSchema: ManifestPayloadSchema = 'network.xyo.manifest'

export interface Manifest {
  description?: string
  id?: string
  name?: string
}

export interface DappManifest extends Manifest {
  modules?: {
    private?: ModuleManifest[]
    public?: ModuleManifest[]
  }
}

export interface ModuleManifest extends Manifest {
  accountPath?: string
  config?: ModuleConfig
  features?: string[]
  language?: string
  os?: string
}

export type ManifestPayload = Payload<
  {
    dapps: DappManifest[]
    modules?: Record<string, ModuleManifest>
  },
  ManifestPayloadSchema
>
