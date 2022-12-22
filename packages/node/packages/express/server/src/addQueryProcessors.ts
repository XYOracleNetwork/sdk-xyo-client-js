import { delay } from '@xylabs/delay'
import { dependencies } from '@xyo-network/express-node-dependencies'
import { isProduction } from '@xyo-network/express-node-middleware'
import {
  DebugSchema,
  GetArchivePermissionsSchema,
  GetDomainConfigSchema,
  GetSchemaSchema,
  Query,
  QueryHandler,
  QueryProcessorRegistry,
  SetArchivePermissionsSchema,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import {
  DebugQueryHandler,
  GetArchivePermissionsQueryHandler,
  GetDomainConfigQueryHandler,
  GetSchemaQueryHandler,
  SetArchivePermissionsQueryHandler,
} from '@xyo-network/node-core-query-handlers'
import { XyoPayload } from '@xyo-network/payload-model'
import { Application } from 'express'

export const addQueryProcessors = (app: Application) => {
  const registry: QueryProcessorRegistry = app.queryProcessors
  if (!isProduction()) {
    addDebug(registry)
  }
  addQueries(registry)
}

const addDebug = (registry: QueryProcessorRegistry) => {
  registry.registerProcessorForSchema(DebugSchema, (payload) => dependencies.get<QueryHandler<Query<XyoPayload>>>(DebugQueryHandler).handle(payload))
  registry.registerProcessorForSchema('network.xyo.test', async () => {
    await delay(1)
    return {} as XyoPayloadWithMeta
  })
}

const addQueries = (registry: QueryProcessorRegistry) => {
  registry.registerProcessorForSchema(SetArchivePermissionsSchema, (payload) =>
    dependencies.get<QueryHandler<Query<XyoPayload>>>(SetArchivePermissionsQueryHandler).handle(payload),
  )
  registry.registerProcessorForSchema(GetArchivePermissionsSchema, (payload) =>
    dependencies.get<QueryHandler<Query<XyoPayload>>>(GetArchivePermissionsQueryHandler).handle(payload),
  )
  registry.registerProcessorForSchema(GetDomainConfigSchema, (payload) =>
    dependencies.get<QueryHandler<Query<XyoPayload>>>(GetDomainConfigQueryHandler).handle(payload),
  )
  registry.registerProcessorForSchema(GetSchemaSchema, (payload) =>
    dependencies.get<QueryHandler<Query<XyoPayload>>>(GetSchemaQueryHandler).handle(payload),
  )
}
