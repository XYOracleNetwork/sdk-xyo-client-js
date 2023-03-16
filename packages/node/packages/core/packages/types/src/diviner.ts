import { ModuleList } from './ModuleList'

export const DIVINER_TYPES: ModuleList = {
  AddressHistoryDiviner: Symbol('AddressHistoryDiviner'),
  AddressSpaceDiviner: Symbol('AddressSpaceDiviner'),
  BoundWitnessDiviner: Symbol('BoundWitnessDiviner'),
  BoundWitnessStatsDiviner: Symbol('BoundWitnessStatsDiviner'),
  ElevationDiviner: Symbol('ElevationDiviner'),
  PayloadDiviner: Symbol('PayloadDiviner'),
  PayloadStatsDiviner: Symbol('PayloadStatsDiviner'),
  SchemaStatsDiviner: Symbol('SchemaStatsDiviner'),
}
