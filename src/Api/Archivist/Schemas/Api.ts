import { XyoSchemaCacheEntry } from '../../../SchemaCache'
import { XyoApiSimple } from '../../Simple'
import { XyoArchivistSchemaApi } from '../Schema'

export class XyoArchivistSchemasApi extends XyoApiSimple<XyoSchemaCacheEntry[]> {
  public schema(schema = 'network.xyo.schema') {
    return new XyoArchivistSchemaApi({
      ...this.config,
      root: `${this.root}${schema}/`,
    })
  }
}
