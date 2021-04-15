import { WithXyoAddresses } from './Addresses'
import { WithXyoHash } from './Hashes'
import { WithXyoMeta } from './Meta'
import { WithXyoSignatures } from './Signatures'

interface XyoEntryJson {
  previous_hash?: string
  schema: string
  timestamp: number
}

type XyoAddressedEntryJson = WithXyoAddresses<XyoEntryJson>
type XyoHashedEntryJson = WithXyoHash<XyoAddressedEntryJson>
type XyoSignedEntryJson = WithXyoMeta<WithXyoSignatures<XyoHashedEntryJson>>
type XyoStoredEntryJson = WithXyoMeta<XyoSignedEntryJson>

export type { XyoAddressedEntryJson, XyoEntryJson, XyoHashedEntryJson, XyoSignedEntryJson, XyoStoredEntryJson }
