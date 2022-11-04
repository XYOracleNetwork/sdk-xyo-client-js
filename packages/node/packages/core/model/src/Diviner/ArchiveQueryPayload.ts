import { XyoQuery } from '@xyo-network/module'

// TODO: Can we remove this type completely and inject archive in config?
export type ArchiveQueryPayload<T extends XyoQuery = XyoQuery> = XyoQuery<T & { archive?: string }>
