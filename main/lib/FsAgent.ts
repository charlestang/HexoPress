import { mkdir, readdir, rename, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export class FsAgent {
  sourceDir: string

  constructor() {}

  init(baseDirectory: string) {
    this.sourceDir = join(baseDirectory, 'source')
  }

  async readdir(directory = '') {
    const targetPath = join(this.sourceDir, directory)
    const contents = await readdir(targetPath, { withFileTypes: true })

    const transformedContents = contents
      .filter(dirent => !dirent.name.startsWith('.'))
      .map(dirent => ({
        name: dirent.name,
        relativePath: join(directory, dirent.name),
        type: dirent.isDirectory() ? 'directory' : 'file',
      }))

    return transformedContents
  }

  async mv(from: string, to: string) {
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
      if (err) {
        console.log(err)
        return false
      }
    }

    return true
  }
}

const fsAgent = new FsAgent()

export default fsAgent
