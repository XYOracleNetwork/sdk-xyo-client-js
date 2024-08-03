import { assertEx } from '@xylabs/assert'
import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { NodeInstance } from '@xyo-network/node-model'

// eslint-disable-next-line import/no-internal-modules
import { ArchivistName } from '../Node/getTestNode.ts'

export const getArchivist = async (node: NodeInstance, name = ArchivistName): Promise<ArchivistInstance> => {
  return assertEx(asArchivistInstance(await node.resolve(name)), () => `Could not find archivist with name ${name}`)
}
