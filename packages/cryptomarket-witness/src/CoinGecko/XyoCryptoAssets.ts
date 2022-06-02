import { PartialRecord } from '../PartialRecord'

export type XyoCryptoAssets = PartialRecord<string, PartialRecord<string, number> | undefined>
