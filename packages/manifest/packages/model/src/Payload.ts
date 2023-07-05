import { ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type ManifestPayloadSchema = 'network.xyo.manifest'
export const ManifestPayloadSchema: ManifestPayloadSchema = 'network.xyo.manifest'

export interface Manifest {
  description?: string
}

export type ConfigManifest = ModuleConfig<{ schema: string }> & {
  accountPath?: string
  features?: string[]
  language?: string
  name: string
  os?: string
}

export interface NodeManifest extends ModuleManifest {
  modules?: {
    private?: ModuleManifest[]
    public?: ModuleManifest[]
  }
}

export interface ModuleManifest extends Manifest {
  config: ConfigManifest
}

export type ManifestPayload = Payload<
  {
    modules?: Record<string, ModuleManifest>
    nodes: NodeManifest[]
  },
  ManifestPayloadSchema
>
