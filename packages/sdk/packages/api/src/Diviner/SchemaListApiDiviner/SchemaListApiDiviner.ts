import { assertEx } from '@xylabs/sdk-js'
import { XyoDiviner, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoSchemaSchema } from '@xyo-network/schema-payload-plugin'

import { XyoArchivistApi } from '../../Api'
import { SchemaList } from './Payload'
import { XyoSchemaListApiDivinerConfig, XyoSchemaListApiDivinerConfigSchema } from './SchemaListApiDivinerConfig'

export type XyoSchemaListApiDivinerParams = XyoModuleParams<XyoSchemaListApiDivinerConfig> & { api: XyoArchivistApi }

export class SchemaListApiDiviner extends XyoDiviner<XyoSchemaListApiDivinerConfig> {
  static override configSchema = XyoSchemaListApiDivinerConfigSchema
  static override targetSchema = XyoSchemaSchema

  protected readonly api: XyoArchivistApi

  protected constructor(params: XyoSchemaListApiDivinerParams) {
    super(params)
    this.api = params.api
  }

  get archive() {
    return assertEx(this.config?.archive, `SchemaListApiDiviner config.archive required [${JSON.stringify(this.config, null, 2)}]`)
  }

  static override async create(params: XyoSchemaListApiDivinerParams): Promise<SchemaListApiDiviner> {
    return (await super.create(params)) as SchemaListApiDiviner
  }

  public async divine(): Promise<SchemaList[]> {
    const apiResult = (await this.api.archive(this.archive)?.payload.schema.get()) ?? []
    return (
      apiResult.map((schema) => {
        return {
          name: schema,
          schema: XyoSchemaSchema,
        }
      }) ?? []
    )
  }

  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  protected override async start() {
    await super.start()
    return this
  }
}
