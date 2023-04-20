/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'arima' {
  // eslint-disable-next-line import/no-default-export
  export default class ARIMA {
    constructor(options: any)
    predict(steps: number): number[]
  }
}
