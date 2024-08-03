/* eslint-disable import/no-internal-modules */
/* eslint-disable @typescript-eslint/no-require-imports */
export const subtleHashFunc = () => {
  const { subtle } = require('@xylabs/platform')
  const { expose } = require('@xylabs/threads/worker')

  expose({
    async hash(data: ArrayBuffer) {
      return await subtle.digest('SHA-256', data)
    },
  })
}
