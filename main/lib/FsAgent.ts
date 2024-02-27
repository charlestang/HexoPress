import { mkdir, readdir, rename, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'

interface DirentTransformed {
  name: string
  relativePath: string
  type: 'directory' | 'file'
}

export class FsAgent {
  private sourceDir: string

  constructor() {
    this.sourceDir = ''
  }

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
    const toDir = await stat(dirname(toPath))
    if (!toDir.isDirectory()) {
      try {
        await mkdir(dirname(toPath), { recursive: true })
      } catch (err) {
        console.log(err)
        return false
      }
    }

    try {
      await rename(fromPath, toPath)
    } catch (err) {
      console.log(err)
      return false
    }

    return true
  }
}

const fsAgent = new FsAgent()

export default fsAgent
