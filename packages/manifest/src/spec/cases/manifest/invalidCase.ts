export const invalidPackageManifestSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  foo: 'bar',
  nodes: [
    {
      config3: {
        accountPath: "0'",
        name: 1,
        schema: 'network.xyo.node.config',
      },
      modules: {
        public2: [
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
