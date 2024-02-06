export const invalidDappPackageManifestSchema = {
  external: {
    modules1: [
      {
        name: 'SomeModule',
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
        public1: [
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
