import * as matchers from 'jest-extended'
import { expect, vi } from 'vitest'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi // replace jest with vi

// Extend Vitest's expect with jest-extended matchers
expect.extend(matchers)
