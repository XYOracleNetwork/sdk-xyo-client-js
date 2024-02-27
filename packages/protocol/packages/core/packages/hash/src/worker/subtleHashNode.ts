/* eslint-disable @typescript-eslint/no-var-requires */
export const subtleHashFunc = () => {
  const { subtle } = require('@xylabs/platform')
  // eslint-disable-next-line import/no-internal-modules
  const { expose } = require('@xylabs/threads/worker')

  expose({
    async hash(data: ArrayBuffer) {
      return await subtle.digest('SHA-256', data)
    },
  })
}
