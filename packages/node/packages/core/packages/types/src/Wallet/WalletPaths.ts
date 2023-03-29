/* eslint-disable sort-keys-fix/sort-keys-fix */

const RootPath = "m/44'/60'/1'" as const

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
    AddressHistoryDiviner: `${ModulePath.Diviner}/1'` as const,
    AddressSpaceDiviner: `${ModulePath.Diviner}/2'` as const,
    BoundWitnessDiviner: `${ModulePath.Diviner}/3'` as const,
    PayloadDiviner: `${ModulePath.Diviner}/4'` as const,
    SchemaListDiviner: `${ModulePath.Diviner}/5'` as const,
    BoundWitnessStatsDiviner: `${ModulePath.Diviner}/6'` as const,
    PayloadStatsDiviner: `${ModulePath.Diviner}/7'` as const,
    SchemaStatsDiviner: `${ModulePath.Diviner}/8'` as const,
  } as const,
  Witnesses: {} as const,
} as const
