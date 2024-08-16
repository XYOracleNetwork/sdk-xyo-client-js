import { ArchivistConfigSchema } from '@xyo-network/archivist-model'
import type { PackageManifestPayload } from '@xyo-network/manifest-model'
import { PackageManifestPayloadSchema } from '@xyo-network/manifest-model'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { SentinelConfigSchema } from '@xyo-network/sentinel-model'

export const defaultPackageManifest: PackageManifestPayload = {
  nodes: [
    {
      config: {
        name: 'SimpleMemoryDapp',
        schema: NodeConfigSchema,
      },
      modules: {
        private: [
          {
            config: {
              name: 'ScratchArchivist',
              schema: ArchivistConfigSchema,
            },
          },
        ],
        public: [
          {
            config: {
              name: 'SimpleArchivist',
              schema: ArchivistConfigSchema,
            },
          },
          {
            config: {
              name: 'SimpleSentinel',
              schema: SentinelConfigSchema,
            },
          },
        ],
      },
    },
  ],
  schema: PackageManifestPayloadSchema,
}
