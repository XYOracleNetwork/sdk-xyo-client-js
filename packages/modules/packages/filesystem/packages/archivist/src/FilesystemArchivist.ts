import { readFile } from 'node:fs/promises'

import { assertEx } from '@xylabs/assert'
import {
  AbstractArchivist,
  MemoryArchivist,
  XyoArchivistAllQuerySchema,
  XyoArchivistCommitQuerySchema,
  XyoArchivistConfig,
  XyoArchivistFindQuerySchema,
} from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { ModuleParams } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'
import { PromisableArray } from '@xyo-network/promise'

export interface FileSystemArchivistData {
  payloads: XyoPayload[]
}

export type FilesystemArchivistConfigSchema = 'network.xyo.module.config.archivist.filesystem'
export const FilesystemArchivistConfigSchema: FilesystemArchivistConfigSchema = 'network.xyo.module.config.archivist.filesystem'

export type FilesystemArchivistConfig = XyoArchivistConfig<{
  filePath: string
  schema: FilesystemArchivistConfigSchema
}>

/** @description Currently only a read-only archivist that loads payloads from filesystem
 * but allows for future expansion to read/write
 */
export class FilesystemArchivist<TConfig extends FilesystemArchivistConfig = FilesystemArchivistConfig> extends AbstractArchivist<TConfig> {
  static override configSchema = FilesystemArchivistConfigSchema

  private _memoryArchivist?: MemoryArchivist

  protected constructor(params: ModuleParams<TConfig>) {
    super(params)
  }

  public get filePath() {
    return this.config?.filePath ?? 'archivist.xyo.json'
  }

  private get memoryArchivist() {
    return assertEx(this._memoryArchivist)
  }

  static override async create(params?: ModuleParams<FilesystemArchivistConfig>): Promise<FilesystemArchivist> {
    const instance = (await super.create(params)) as FilesystemArchivist
    await instance.loadFromFile()
    return instance
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

  public override all(): PromisableArray<XyoPayload> {
    return this.memoryArchivist.all()
  }

  public override clear(): void | Promise<void> {
    return this.memoryArchivist.clear()
  }

  public override async commit(): Promise<XyoBoundWitness[]> {
    return await this.memoryArchivist.commit()
  }

  public override delete(hashes: string[]): PromisableArray<boolean> {
    return this.memoryArchivist.delete(hashes)
  }

  public async get(hashes: string[]): Promise<XyoPayload[]> {
    return await this.memoryArchivist.get(hashes)
  }

  public async insert(payloads: XyoPayload[]): Promise<XyoBoundWitness[]> {
    return await this.memoryArchivist.insert(payloads)
  }

  public override queries() {
    return [XyoArchivistAllQuerySchema, XyoArchivistFindQuerySchema, XyoArchivistCommitQuerySchema, ...super.queries()]
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
