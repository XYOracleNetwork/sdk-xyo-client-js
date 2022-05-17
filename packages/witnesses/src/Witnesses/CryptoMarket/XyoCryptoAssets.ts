import { AssetSymbol } from './AssetSymbol'
import { PartialRecord } from './PartialRecord'

export type XyoCryptoAssets = PartialRecord<AssetSymbol, PartialRecord<AssetSymbol, number> | undefined>
