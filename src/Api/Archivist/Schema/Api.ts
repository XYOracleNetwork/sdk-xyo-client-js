import { XyoFetchedPayload } from '../../../core'
import { XyoSchemaPayload } from '../../../Witnesses'
import { XyoApiSimple } from '../../Simple'

export class XyoArchivistSchemaApi extends XyoApiSimple<XyoFetchedPayload<XyoSchemaPayload>> {}
