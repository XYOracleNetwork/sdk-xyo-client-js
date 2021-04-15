import { WithXyoAddresses } from './Addresses'
import { XyoSignedEntryJson } from './Entry'
import { WithXyoHash } from './Hashes'
import { WithXyoMeta } from './Meta'
import { WithXyoSignatures } from './Signatures'

interface XyoBlockJson {
  entries: XyoSignedEntryJson[]
  previous_hash?: string
  timestamp: number
}

type XyoAddressedBlockJson = WithXyoAddresses<XyoBlockJson>
type XyoHashedBlockJson = WithXyoHash<XyoAddressedBlockJson>
type XyoSignedBlockJson = WithXyoMeta<WithXyoSignatures<XyoHashedBlockJson>>
type XyoStoredBlockJson = WithXyoMeta<XyoSignedBlockJson>

export type { XyoAddressedBlockJson, XyoBlockJson, XyoHashedBlockJson, XyoSignedBlockJson, XyoStoredBlockJson }
