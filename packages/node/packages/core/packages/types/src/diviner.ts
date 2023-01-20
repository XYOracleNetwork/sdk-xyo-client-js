import { ModuleList } from './ModuleList'

export const DIVINER_TYPES: ModuleList = {
  AddressHistoryDiviner: Symbol('AddressHistoryDiviner'),
  BoundWitnessDiviner: Symbol('BoundWitnessDiviner'),
  BoundWitnessStatsDiviner: Symbol('BoundWitnessStatsDiviner'),
  ElevationDiviner: Symbol('ElevationDiviner'),
  ModuleAddressDiviner: Symbol('ModuleAddressDiviner'),
  PayloadDiviner: Symbol('PayloadDiviner'),
  PayloadStatsDiviner: Symbol('PayloadStatsDiviner'),
  SchemaStatsDiviner: Symbol('SchemaStatsDiviner'),
}
