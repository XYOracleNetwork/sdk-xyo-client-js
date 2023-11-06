import { ArchivistConfigSchema } from '@xyo-network/archivist-model'
import { PackageManifestPayload, PackageManifestPayloadSchema } from '@xyo-network/manifest-model'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { SentinelConfigSchema } from '@xyo-network/sentinel'

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
              language: 'javascript',
              name: 'ScratchArchivist',
              schema: ArchivistConfigSchema,
            },
          },
        ],
        public: [
          {
            config: {
              language: 'javascript',
              name: 'SimpleArchivist',
              schema: ArchivistConfigSchema,
            },
          },
          {
            config: {
              language: 'javascript',
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
