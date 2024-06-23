import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistConfigSchema } from '@xyo-network/archivist-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema } from '@xyo-network/node-model'

const rootNodeName = 'root'
const nodeAName = 'nodeA'
const nodeBName = 'nodeB'
const moduleAName = 'module'
const moduleBName = 'module'
const moduleCName = 'moduleC'

/**
 * @group module
 */

describe('UpDown', () => {
  test('two archivists same name, different nodes', async () => {
    const rootNode = await MemoryNode.create({ account: 'random', config: { name: rootNodeName, schema: NodeConfigSchema } })
    const nodeA = await MemoryNode.create({ account: 'random', config: { name: nodeAName, schema: NodeConfigSchema } })
    const nodeB = await MemoryNode.create({ account: 'random', config: { name: nodeBName, schema: NodeConfigSchema } })
    const moduleA = await MemoryArchivist.create({ account: 'random', config: { name: moduleAName, schema: ArchivistConfigSchema } })
    const moduleB = await MemoryArchivist.create({ account: 'random', config: { name: moduleBName, schema: ArchivistConfigSchema } })
    const moduleC = await MemoryArchivist.create({ account: 'random', config: { name: moduleCName, schema: ArchivistConfigSchema } })

    await nodeA.register(moduleA)
    await nodeA.attach(moduleA.address, true)

    await nodeB.register(moduleB)
    await nodeB.register(moduleC)
    await nodeB.attach(moduleB.address, true)
    await nodeB.attach(moduleC.address)

    await rootNode.register(nodeA)
    await rootNode.attach(nodeA.address, true)
    await rootNode.register(nodeB)
    await rootNode.attach(nodeB.address, true)

    const upAndDownResolve = await moduleA.resolve(`${nodeAName}:${moduleAName}`)
    expect(upAndDownResolve?.address).toBe(moduleA.address)

    const upAndDownResolvePrivate = await moduleA.resolvePrivate(`${nodeBName}:${moduleCName}`)
    expect(upAndDownResolvePrivate?.address).toBe(moduleC.address)
  })
})
