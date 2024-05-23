import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistConfigSchema } from '@xyo-network/archivist-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema } from '@xyo-network/node-model'

const nodeAName = 'nodeA'
const rootPrivateNodeName = 'rootPrivateNode'
const rootPrivateName = 'rootPrivate'
const moduleAName = 'module'

/**
 * @group module
 */

describe('ParentsPrivates', () => {
  test("children should be able to see parent's privates", async () => {
    const rootNode = await MemoryNode.create({ account: 'random' })
    const rootPrivateNode = await MemoryNode.create({ account: 'random', config: { name: rootPrivateNodeName, schema: NodeConfigSchema } })
    const rootPrivate = await MemoryArchivist.create({ account: 'random', config: { name: rootPrivateName, schema: ArchivistConfigSchema } })
    const nodeA = await MemoryNode.create({ account: 'random', config: { name: nodeAName, schema: NodeConfigSchema } })
    const moduleA = await MemoryArchivist.create({ account: 'random', config: { name: moduleAName, schema: ArchivistConfigSchema } })

    await rootPrivateNode.register(rootPrivate)
    await rootPrivateNode.attach(rootPrivate.address, false)

    await nodeA.register(moduleA)
    await nodeA.attach(moduleA.address, true)

    const resolvedModuleAFromNodeA = await nodeA.resolve(moduleAName)
    expect(resolvedModuleAFromNodeA?.address).toBe(moduleA.address)

    await rootNode.register(rootPrivateNode)
    await rootNode.attach(rootPrivateNode.address, false)

    await rootNode.register(nodeA)
    await rootNode.attach(nodeA.address, true)

    const resolveRootPrivateNode = await nodeA.resolve(rootPrivateNodeName)
    expect(resolveRootPrivateNode).toBeDefined()

    const resolveRootPrivate = await nodeA.resolve(rootPrivateName)
    expect(resolveRootPrivate).toBeUndefined()
  })
})
