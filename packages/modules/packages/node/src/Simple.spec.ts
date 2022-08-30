import { XyoMemoryArchivist } from '@xyo-network/archivist'
import { XyoModule } from '@xyo-network/module'
import { XyoAccount } from '@xyo-network/sdk'

import { XyoSimpleNode } from './Simple'

test('Create Node', () => {
  const node = new XyoSimpleNode()
  const archivistAccount = new XyoAccount()
  const archivist: XyoModule = new XyoMemoryArchivist({ account: archivistAccount })
  node.attach(archivist)
  expect(node.list().length).toBe(1)
})
