export const defaultNodeManifest = {
  dapps: [
    {
      modules: {
        private: [
          {
            name: 'ScratchArchivist',
          },
        ],
        public: [
          {
            name: 'SimpleArchivist',
          },
          {
            name: 'SimpleSentinel',
          },
        ],
      },
      name: 'SimpleMemoryDapp',
    },
  ],
  modules: {
    ScratchArchivist: {
      id: 'network.xyo.archivist',
      language: 'javascript',
    },
    SimpleArchivist: {
      id: 'network.xyo.archivist',
      language: 'javascript',
    },
    SimpleSentinel: {
      id: 'network.xyo.sentinel',
      language: 'javascript',
    },
  },
  schema: 'network.xyo.manifest',
}
