import { access, mkdir, readdir, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

interface DirentTransformed {
  name: string
  relativePath: string
  type: 'directory' | 'file'
}

export class FsAgent {
  private sourceDir: string = ''

  init(baseDirectory: string): void {
    this.sourceDir = join(baseDirectory, 'source')
  }

  async readdir(directory = ''): Promise<DirentTransformed[]> {
    const targetPath = join(this.sourceDir, directory)
    const contents = await readdir(targetPath, { withFileTypes: true })

    const transformedContents = contents
      .filter((dirent) => !dirent.name.startsWith('.'))
      .map(
        (dirent) =>
          ({
            name: dirent.name,
            relativePath: join(directory, dirent.name),
            type: dirent.isDirectory() ? 'directory' : 'file',
          }) as DirentTransformed,
      )

    return transformedContents
  }

  async mv(from: string, to: string): Promise<boolean> {
    const fromPath = join(this.sourceDir, from)
    const toPath = join(this.sourceDir, to)

    await this.assureDir(toPath)

    try {
      await rename(fromPath, toPath)
    } catch (err) {
      console.error('mv, err: ', err)
      return false
    }

    return true
  }

  async assureDir(path: string): Promise<void> {
    console.log('assureDir, path: ', path)
    try {
      await access(dirname(path))
    } catch (err) {
      console.error('assureDir, err: ', err)
      console.log('assureDir, creating dir: ', dirname(path))
      await mkdir(dirname(path), { recursive: true })
    }
  }

  async saveImage(path: string, content: ArrayBuffer): Promise<void> {
    console.log('saveImage, path: ', path, ' length: ', content.byteLength)
    const targetPath = join(this.sourceDir, 'images', path)
    await this.assureDir(targetPath)
    return writeFile(targetPath, Buffer.from(content))
  }
}

const fsAgent = new FsAgent()

export default fsAgent
