import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { DebugPayload, DebugQuery, DebugSchema, QueryHandler } from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload'
import { injectable } from 'inversify'

@injectable()
export class DebugQueryHandler implements QueryHandler<DebugQuery, DebugPayload> {
  async handle(query: DebugQuery) {
    const ms = query?.payload?.delay || 1
    assertEx(ms > 0, 'Debug delay must be a positive, non-zero number.')
    await delay(ms)
    return new XyoPayloadBuilder<DebugPayload>({ schema: DebugSchema }).fields(query.payload).build()
  }
}
