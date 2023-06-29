import { ArchivistConfigSchema } from '@xyo-network/archivist'
import { ManifestPayload } from '@xyo-network/manifest'
import { NodeConfigSchema } from '@xyo-network/node'
import { SentinelConfigSchema } from '@xyo-network/sentinel'

export const defaultNodeManifest: ManifestPayload = {
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
  schema: 'network.xyo.manifest',
}
