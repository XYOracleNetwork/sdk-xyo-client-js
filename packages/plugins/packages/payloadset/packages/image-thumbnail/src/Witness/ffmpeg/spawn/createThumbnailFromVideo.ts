import { executeFFmpeg } from './executeFfmpeg'

/**
 * Execute FFmpeg with provided input buffer and return video thumbnail image.
 * @param videoBuffer Input video buffer.
 * @returns Output buffer containing the video thumbnail image.
 */
export const createThumbnailFromVideo = async (videoBuffer: Buffer) => {
  const imageBuffer = await executeFFmpeg(videoBuffer)
  return imageBuffer
}
