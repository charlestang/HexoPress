import { readdir } from 'fs/promises'
import { join } from 'path'

class FsAgent {
  constructor() {}

  init(baseDirectory) {
    this.sourceDir = join(baseDirectory, 'source')
  }

  async readdir(directory = '') {
    console.log('FsAgent called to iterate directory', directory)
    const targetPath = join(this.sourceDir, directory)
    const contents = await readdir(targetPath)
    console.log('results not filtered: ', contents)
    return contents.filter((item) => item !== '.' && item !== '..' && !item.startsWith('.'))
  }
}

const fsAgent = new FsAgent()

export default fsAgent
