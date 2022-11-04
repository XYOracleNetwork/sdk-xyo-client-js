import { DebugQuery, DebugSchema } from '@xyo-network/node-core-model'

import { DebugQueryHandler } from './DebugQueryHandler'

const schema = DebugSchema

describe('DebugQueryHandler', () => {
  it('delays for the specified amount of time supplied', async () => {
    const sut = new DebugQueryHandler()
    await sut.handle(new DebugQuery({ delay: 1, schema }))
  })
})
