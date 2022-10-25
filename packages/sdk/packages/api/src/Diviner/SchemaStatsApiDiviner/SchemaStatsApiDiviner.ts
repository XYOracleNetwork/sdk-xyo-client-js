import { assertEx } from '@xylabs/sdk-js'
import { XyoDiviner, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner'
import { XyoModuleParams } from '@xyo-network/module'

import { XyoArchivistApi } from '../../Api'
import { SchemaStats, SchemaStatsSchema } from './Payload'
import { XyoSchemaStatsApiDivinerConfig, XyoSchemaStatsApiDivinerConfigSchema } from './SchemaStatsApiDivinerConfig'

export type XyoSchemaStatsApiDivinerParams = XyoModuleParams<XyoSchemaStatsApiDivinerConfig> & { api: XyoArchivistApi }

export class SchemaStatsApiDiviner extends XyoDiviner<XyoSchemaStatsApiDivinerConfig> {
  protected readonly api: XyoArchivistApi

  get archive() {
    return assertEx(this.config?.archive, `config required [${this.config}]`)
  }

  static override async create(params: XyoSchemaStatsApiDivinerParams): Promise<SchemaStatsApiDiviner> {
    return (await super.create(params)) as SchemaStatsApiDiviner
  }

  protected constructor(params: XyoSchemaStatsApiDivinerParams) {
    super(params)
    this.api = params.api
  }

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  protected override async start() {
    await super.start()
    return this
  }

  public async divine(): Promise<SchemaStats[]> {
    const stats = await this.api.archive(this.archive).payload.schema.stats.get()
    const result: SchemaStats[] = [
      {
        counts: stats?.counts ?? {},
        schema: SchemaStatsSchema,
      },
    ]
    return result
  }

  static override configSchema = XyoSchemaStatsApiDivinerConfigSchema
  static override targetSchema = SchemaStatsSchema
}
