import { mkdir, readdir, rename, stat } from 'fs/promises'
import { dirname, join } from 'path'

export class FsAgent {
  constructor() {}

  init(baseDirectory) {
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

  async mv(from, to) {
    const fromPath = join(this.sourceDir, from)
    const toPath = join(this.sourceDir, to)
    const toDir = await stat(dirname(toPath))
    if (!toDir.isDirectory()) {
      const res = await mkdir(toDir, { recursive: true })
      if (!res) {
        return false
      }
    }

    await rename(fromPath, toPath, err => {
      if (err) {
        console.log(err)
        return false
      }
    })

    return true
  }
}

const fsAgent = new FsAgent()

export default fsAgent
