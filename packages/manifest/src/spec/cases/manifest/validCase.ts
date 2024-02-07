export const validPackageManifestSchema = {
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
