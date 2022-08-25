export * from '@xyo-network/bowser-system-info-payload-plugin'

import { XyoBowserSystemInfoPayloadPlugin } from '@xyo-network/bowser-system-info-payload-plugin'

import { XyoAllPayloadPlugins } from './indexShared'

export const XyoAllBrowserPayloadPlugins = [...XyoAllPayloadPlugins, XyoBowserSystemInfoPayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoAllBrowserPayloadPlugins
