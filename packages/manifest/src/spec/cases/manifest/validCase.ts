export const validPackageManifestSchema = {
  $schema: 'https://raw.githubusercontent.com/XYOracleNetwork/sdk-xyo-client-js/main/packages/manifest/src/compilations/schema.json',
  nodes: [
    {
      config: {
        accountPath: "0'",
        name: 'DappNode',
        schema: 'network.xyo.node.config',
      },
      modules: {
        public: [
          {
            config: {
              accountPath: "1'",
              name: 'SomeArchivist',
              schema: 'network.xyo.archivist.config',
            },
          },
        ],
      },
    },
  ],
  schema: 'network.xyo.manifest',
}
