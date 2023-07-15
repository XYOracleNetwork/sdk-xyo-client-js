import { readFile } from 'node:fs/promises'

import { assertEx } from '@xylabs/assert'
import { AbstractDirectArchivist } from '@xyo-network/abstract-archivist'
import {
  ArchivistAllQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistParams,
  DirectArchivistModule,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { handleError } from '@xyo-network/error'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { PromisableArray } from '@xyo-network/promise'

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
  extends AbstractDirectArchivist<TParams>
  implements DirectArchivistModule
{
  static override configSchemas = [FilesystemArchivistConfigSchema]

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

  private static dataFromRawJson(rawJson: string) {
    const data: FileSystemArchivistData = JSON.parse(rawJson)
    assertEx(typeof data === 'object', 'Archivist Data must be object')
    assertEx(Array.isArray(data.payloads), 'Archivist Data "payloads" field must be array of payloads')
    data.payloads = this.payloadsFromRawPayloads(data.payloads)
    return data
  }

  private static payloadsFromRawPayloads(rawPayloads: Payload[]) {
    //validation should be done in here.  I don't believe parse does much validation yet.
    return rawPayloads.map((payload) => PayloadWrapper.wrap(payload).payload())
  }

  protected override allHandler(): PromisableArray<Payload> {
    return this.memoryArchivist.all()
  }

  protected override clearHandler(): void | Promise<void> {
    return this.memoryArchivist.clear()
  }

  protected override async commitHandler(): Promise<BoundWitness[]> {
    return await this.memoryArchivist.commit()
  }

  protected override deleteHandler(hashes: string[]): PromisableArray<boolean> {
    return this.memoryArchivist.delete(hashes)
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    return await this.memoryArchivist.get(hashes)
  }

  protected async insertHandler(payloads: Payload[]): Promise<BoundWitness[]> {
    return await this.memoryArchivist.insert(payloads)
  }

  protected override async startHandler() {
    await super.startHandler()
    this._memoryArchivist = await MemoryArchivist.create()
    try {
      const data = FilesystemArchivist.dataFromRawJson(await this.rawJsonFromFile())
      await this._memoryArchivist.insert(data.payloads)
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
