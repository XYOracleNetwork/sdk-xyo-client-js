import { assertEx } from '@xylabs/sdk-js'
import { AbstractDiviner, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner'
import { ModuleParams } from '@xyo-network/module'

import { XyoArchivistApi } from '../../Api'
import { SchemaStats, SchemaStatsSchema } from './Payload'
import { XyoSchemaStatsApiDivinerConfig, XyoSchemaStatsApiDivinerConfigSchema } from './SchemaStatsApiDivinerConfig'

export type XyoSchemaStatsApiDivinerParams = ModuleParams<XyoSchemaStatsApiDivinerConfig> & { api: XyoArchivistApi }

export class SchemaStatsApiDiviner extends AbstractDiviner<XyoSchemaStatsApiDivinerConfig> {
  static override configSchema = XyoSchemaStatsApiDivinerConfigSchema
  static override targetSchema = SchemaStatsSchema

  protected readonly api: XyoArchivistApi

  protected constructor(params: XyoSchemaStatsApiDivinerParams) {
    super(params)
    this.api = params.api
  }

  get archive() {
    return assertEx(this.config?.archive, `SchemaStatsApiDiviner config.archive required [${JSON.stringify(this.config, null, 2)}]`)
  }

  static override async create(params: XyoSchemaStatsApiDivinerParams): Promise<SchemaStatsApiDiviner> {
    return (await super.create(params)) as SchemaStatsApiDiviner
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

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  protected override async start() {
    await super.start()
    return this
  }
}
