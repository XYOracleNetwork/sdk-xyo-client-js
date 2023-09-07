import { spawn } from 'child_process'

/**
 * Execute FFmpeg with the provided arguments.
 * @param videoBuffer Input video buffer.
 * @param ffmpegArgs FFmpeg arguments.
 * @returns Output buffer containing the video thumbnail image.
 */
export const executeFFmpeg = (videoBuffer: Buffer, ffmpegArgs: string[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const imageData: Buffer[] = []
    const ffmpeg = spawn('ffmpeg', ffmpegArgs)
    ffmpeg.stdout.on('data', (data: Buffer) => imageData.push(data))
    // TODO: This is required as we're seeing errors thrown due to
    // how we're piping the data to ffmpeg. Works perfectly though.
    ffmpeg.stdin.on('error', () => {})
    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg exited with code ${code}`))
      } else {
        resolve(Buffer.concat(imageData))
      }
    })
    // Pipe the input stream to ffmpeg's stdin
    ffmpeg.stdin.end(videoBuffer)
  })
}
