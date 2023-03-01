/* eslint-disable deprecation/deprecation */
import { assertEx } from '@xylabs/assert'
import { AbstractDiviner, DivinerParams } from '@xyo-network/diviner'
import { ModuleParams } from '@xyo-network/module'

import { XyoArchivistApi } from '../../Api'
import { SchemaStats, SchemaStatsSchema } from './Payload'
import { XyoSchemaStatsApiDivinerConfig, XyoSchemaStatsApiDivinerConfigSchema } from './SchemaStatsApiDivinerConfig'

export type XyoSchemaStatsApiDivinerParams = ModuleParams<XyoSchemaStatsApiDivinerConfig> & { api: XyoArchivistApi }

/** @deprecated - send query to remote module instead */
export class SchemaStatsApiDiviner extends AbstractDiviner<DivinerParams<XyoSchemaStatsApiDivinerConfig>> {
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

  async divine(): Promise<SchemaStats[]> {
    const stats = await this.api.archive(this.archive).payload.schema.stats.get()
    const result: SchemaStats[] = [
      {
        counts: stats?.counts ?? {},
        schema: SchemaStatsSchema,
      },
    ]
    return result
  }

  protected override async start() {
    await super.start()
    return this
  }
}
