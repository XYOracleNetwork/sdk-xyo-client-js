/* eslint-disable sort-keys-fix/sort-keys-fix */

const RootPath = "m/44'/60'/3'" as const

const ModulePath = {
  Node: `${RootPath}/0'` as const,
  Archivist: `${RootPath}/1'` as const,
  Diviner: `${RootPath}/2'` as const,
  Sentinel: `${RootPath}/3'` as const,
  Witness: `${RootPath}/4'` as const,
}

export const WALLET_PATHS = {
  Nodes: {
    Node: `${ModulePath.Node}/0'` as const,
  } as const,
  Archivists: {
    Archivist: `${ModulePath.Archivist}/0'` as const,
  } as const,
  Diviners: {
    Diviner: `${ModulePath.Diviner}/0'` as const,
    AddressHistory: `${ModulePath.Diviner}/1'` as const,
    AddressSpace: `${ModulePath.Diviner}/2'` as const,
    BoundWitness: `${ModulePath.Diviner}/3'` as const,
    Payload: `${ModulePath.Diviner}/4'` as const,
    SchemaList: `${ModulePath.Diviner}/5'` as const,
    BoundWitnessStats: `${ModulePath.Diviner}/6'` as const,
    PayloadStats: `${ModulePath.Diviner}/7'` as const,
    SchemaStats: `${ModulePath.Diviner}/8'` as const,
    LocationCertainty: `${ModulePath.Diviner}/9'` as const,
  } as const,
  Witnesses: {
    Witness: `${ModulePath.Witness}/0'` as const,
    Prometheus: `${ModulePath.Witness}/1'` as const,
  } as const,
} as const
