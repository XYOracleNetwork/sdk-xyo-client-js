import { XyoArchivistQuery } from '@xyo-network/archivist'

import { XyoBridgeQuery } from './Queries'
import { XyoHttpBridge } from './XyoHttpBridge'

export class XyoArchivistHttpBridge<
  TQuery extends XyoBridgeQuery<XyoArchivistQuery> = XyoBridgeQuery<XyoArchivistQuery>,
> extends XyoHttpBridge<TQuery> {}
