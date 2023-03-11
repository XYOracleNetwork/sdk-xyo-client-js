import { readFile } from 'node:fs/promises'

import { assertEx } from '@xylabs/assert'
import { AbstractArchivist } from '@xyo-network/abstract-archivist'
import {
  ArchivistAllQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistFindQuerySchema,
  ArchivistModule,
  ArchivistParams,
} from '@xyo-network/archivist-interface'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { AnyConfigSchema } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { PromisableArray } from '@xyo-network/promise'

export interface FileSystemArchivistData {
  payloads: XyoPayload[]
}

export type FilesystemArchivistConfigSchema = 'network.xyo.module.config.archivist.filesystem'
export const FilesystemArchivistConfigSchema: FilesystemArchivistConfigSchema = 'network.xyo.module.config.archivist.filesystem'

export type FilesystemArchivistConfig = ArchivistConfig<{
  filePath?: string
  schema: FilesystemArchivistConfigSchema
}>

export type FilesystemArchivistParams = ArchivistParams<AnyConfigSchema<FilesystemArchivistConfig>>

/** @description Currently only a read-only archivist that loads payloads from filesystem
 * but allows for future expansion to read/write
 */
export class FilesystemArchivist<TParams extends FilesystemArchivistParams = FilesystemArchivistParams>
  extends AbstractArchivist<TParams>
  implements ArchivistModule
{
  static override configSchema = FilesystemArchivistConfigSchema

  private _memoryArchivist?: MemoryArchivist

  get filePath() {
    return this.config?.filePath ?? 'archivist.xyo.json'
  }

  override get queries() {
    return [ArchivistAllQuerySchema, ArchivistFindQuerySchema, ArchivistCommitQuerySchema, ...super.queries]
  }

  private get memoryArchivist() {
    return assertEx(this._memoryArchivist)
  }

  static override async create<TParams extends FilesystemArchivistParams>(params?: TParams) {
    const instance = (await super.create(params)) as FilesystemArchivist<TParams>
    await instance.loadFromFile()
    return instance as ArchivistModule
  }

  private static dataFromRawJson(rawJson: string) {
    const data: FileSystemArchivistData = JSON.parse(rawJson)
    assertEx(typeof data === 'object', 'Archivist Data must be object')
    assertEx(Array.isArray(data.payloads), 'Archivist Data "payloads" field must be array of payloads')
    data.payloads = this.payloadsFromRawPayloads(data.payloads)
    return data
  }

  private static payloadsFromRawPayloads(rawPayloads: XyoPayload[]) {
    //validation should be done in here.  I don't believe parse does much validation yet.
    return rawPayloads.map((payload) => PayloadWrapper.parse(payload).payload)
  }

  override all(): PromisableArray<XyoPayload> {
    return this.memoryArchivist.all()
  }

  override clear(): void | Promise<void> {
    return this.memoryArchivist.clear()
  }

  override async commit(): Promise<XyoBoundWitness[]> {
    return await this.memoryArchivist.commit()
  }

  override delete(hashes: string[]): PromisableArray<boolean> {
    return this.memoryArchivist.delete(hashes)
  }

  override async get(hashes: string[]): Promise<XyoPayload[]> {
    return await this.memoryArchivist.get(hashes)
  }

  async insert(payloads: XyoPayload[]): Promise<XyoBoundWitness[]> {
    return await this.memoryArchivist.insert(payloads)
  }

  protected async loadFromFile() {
    this._memoryArchivist = await MemoryArchivist.create()
    try {
      const data = FilesystemArchivist.dataFromRawJson(await this.rawJsonFromFile())
      await this._memoryArchivist.insert(data.payloads)
    } catch (ex) {
      const error = ex as Error
      this.logger?.error(error.message)
      throw ex
    }
  }

  private async rawJsonFromFile() {
    return await readFile(this.filePath, { encoding: 'utf8' })
  }
}
