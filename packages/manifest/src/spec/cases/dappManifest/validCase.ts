export const validDappPackageManifestSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  external: {
    modules: [
      {
        name: 'SomeModule',
      },
    ],
  },
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
  schema: 'network.xyo.dapp.manifest.package',
}
