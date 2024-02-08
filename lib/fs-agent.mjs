import { readdir } from 'fs/promises'
import { join } from 'path'

export class FsAgent {
  constructor() {}

  init(baseDirectory) {
    this.sourceDir = join(baseDirectory, 'source')
  }

  async readdir(directory = '') {
    const targetPath = join(this.sourceDir, directory)
    const contents = await readdir(targetPath, { withFileTypes: true })

    const transformedContents = contents
      .filter((dirent) => !dirent.name.startsWith('.'))
      .map((dirent) => ({
        name: dirent.name,
        relativePath: join(directory, dirent.name),
        type: dirent.isDirectory() ? 'directory' : 'file'
      }))

    return transformedContents
  }
}

const fsAgent = new FsAgent()

export default fsAgent
