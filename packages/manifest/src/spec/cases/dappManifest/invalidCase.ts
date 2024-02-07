export const invalidDappPackageManifestSchema = {
  external: {
    modules1: [
      {
        name: 0,
      },
    ],
  },
  nodes: [
    {
      config: {
        accountPath: "0'",
        name: 1,
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
  schema: 'network.xyo.foo.manifest',
}
