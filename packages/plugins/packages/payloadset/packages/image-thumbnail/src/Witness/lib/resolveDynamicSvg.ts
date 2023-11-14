import { axios, AxiosResponse } from '@xylabs/axios'
import { toByteArray } from 'base64-js'
import { Builder, parseStringPromise } from 'xml2js'

export const resolveDynamicSvg = async (base64Bytes: string) => {
  const decoder = new TextDecoder()
  const bytes = toByteArray(base64Bytes)
  const svg = decoder.decode(bytes)
  const svgObj = await parseStringPromise(svg)
  const svgNode = svgObj['svg']
  const imageResults = (await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svgNode['image'].map(async (img: any) => [
      img.$,
      await axios.get(img.$.href, {
        responseType: 'arraybuffer',
      }),
    ]),
  )) as [string, AxiosResponse][]
  const image = imageResults.map(([href, response]) => {
    if (response.data) {
      const sourceBuffer = Buffer.from(response.data, 'binary')
      return { $: { href: `data:${response.headers['content-type']?.toString()};base64,${sourceBuffer.toString('base64')}` } }
    } else {
      return { $: { href } }
    }
  })
  const updatedSVG = { ...svgObj, svg: { ...svgNode, image } }
  const builder = new Builder()
  return builder.buildObject(updatedSVG)
}
