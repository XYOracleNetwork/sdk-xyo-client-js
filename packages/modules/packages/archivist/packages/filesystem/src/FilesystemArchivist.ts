import { readFile } from 'node:fs/promises'

import { assertEx } from '@xylabs/assert'
import { handleError } from '@xylabs/error'
import { Hash } from '@xylabs/hex'
import { PromisableArray } from '@xylabs/promise'
import { HDWallet } from '@xyo-network/account'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import {
  ArchivistAllQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistInstance,
  ArchivistParams,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadWithMeta, Schema, WithMeta } from '@xyo-network/payload-model'

export interface FileSystemArchivistData {
  payloads: Payload[]
}

export type FilesystemArchivistConfigSchema = 'network.xyo.archivist.filesystem.config'
export const FilesystemArchivistConfigSchema: FilesystemArchivistConfigSchema = 'network.xyo.archivist.filesystem.config'

export type FilesystemArchivistConfig = ArchivistConfig<{
  filePath?: string
  schema: FilesystemArchivistConfigSchema
}>

export type FilesystemArchivistParams = ArchivistParams<AnyConfigSchema<FilesystemArchivistConfig>>

/** @description Currently only a read-only archivist that loads payloads from filesystem
 * but allows for future expansion to read/write
 */
@creatableModule()
export class FilesystemArchivist<TParams extends FilesystemArchivistParams = FilesystemArchivistParams>
  extends AbstractArchivist<TParams>
  implements ArchivistInstance
{
  static override readonly configSchemas: Schema[] = [...super.configSchemas, FilesystemArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = FilesystemArchivistConfigSchema

  private _memoryArchivist?: MemoryArchivist

  get filePath() {
    return this.config?.filePath ?? 'archivist.xyo.json'
  }

  override get queries() {
    return [ArchivistAllQuerySchema, ArchivistCommitQuerySchema, ...super.queries]
  }

  private get memoryArchivist() {
    return assertEx(this._memoryArchivist)
  }

  private static async dataFromRawJson(rawJson: string) {
    const data: FileSystemArchivistData = JSON.parse(rawJson)
    assertEx(typeof data === 'object', () => 'Archivist Data must be object')
    assertEx(Array.isArray(data.payloads), () => 'Archivist Data "payloads" field must be array of payloads')
    data.payloads = await this.payloadsFromRawPayloads(data.payloads)
    return data
  }

  private static async payloadsFromRawPayloads(rawPayloads: Payload[]) {
    //validation should be done in here.  I don't believe parse does much validation yet.
    return await Promise.all(rawPayloads.map(async (payload) => await PayloadBuilder.build(payload)))
  }

  protected override allHandler(): PromisableArray<PayloadWithMeta> {
    return this.memoryArchivist.all()
  }

  protected override clearHandler(): void | Promise<void> {
    return this.memoryArchivist.clear()
  }

  protected override async commitHandler(): Promise<WithMeta<BoundWitness>[]> {
    return await this.memoryArchivist.commit()
  }

  protected override deleteHandler(hashes: Hash[]): PromisableArray<Hash> {
    return this.memoryArchivist.delete(hashes)
  }

  protected override async getHandler(hashes: Hash[]): Promise<PayloadWithMeta[]> {
    return await this.memoryArchivist.get(hashes)
  }

  protected override async insertHandler(payloads: Payload[]): Promise<PayloadWithMeta[]> {
    return await this.memoryArchivist.insert(payloads)
  }

  protected override async startHandler() {
    await super.startHandler()
    this._memoryArchivist = await MemoryArchivist.create({ account: await HDWallet.random() })
    try {
      const data = await FilesystemArchivist.dataFromRawJson(await this.rawJsonFromFile())
      await this._memoryArchivist.insert(await Promise.all(data.payloads.map((payload) => PayloadBuilder.build(payload))))
    } catch (ex) {
      handleError(ex, (error) => {
        this.logger?.error(error.message)
      })
      return false
    }
    return true
  }

  private async rawJsonFromFile() {
    return await readFile(this.filePath, { encoding: 'utf8' })
  }
}
