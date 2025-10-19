import type { Dirent } from 'node:fs'
import {
  access,
  mkdir,
  readdir,
  rename,
  stat,
  writeFile as writeFileFs,
  readFile as readFileFs,
  rm,
} from 'node:fs/promises'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { Buffer } from 'node:buffer'

interface DirentTransformed {
  name: string
  relativePath: string
  type: 'directory' | 'file'
}

export class FsAgent {
  private sourceDir: string = ''
  private readonly referenceFileExtensions = new Set([
    '.md',
    '.markdown',
    '.mdx',
    '.html',
    '.htm',
    '.njk',
    '.yml',
    '.yaml',
    '.json',
    '.txt',
  ])

  init(baseDirectory: string): void {
    this.sourceDir = join(baseDirectory, 'source')
  }

  private ensureInitialized(): void {
    if (!this.sourceDir) {
      throw new Error('FsAgent is not initialized')
    }
  }

  private resolveInSource(target: string): string {
    this.ensureInitialized()
    const resolved = resolve(this.sourceDir, target)
    const relativePath = relative(this.sourceDir, resolved)
    if (
      relativePath.startsWith('..') ||
      relativePath.includes('..' + this.pathSeparator) ||
      relativePath === '..'
    ) {
      throw new Error('Path escapes source directory')
    }
    return resolved
  }

  private get pathSeparator(): string {
    return resolve(this.sourceDir).includes('\\') ? '\\' : '/'
  }

  async readdir(directory = ''): Promise<DirentTransformed[]> {
    const targetPath = this.resolveInSource(directory)
    let contents: Dirent[] = []
    try {
      contents = await readdir(targetPath, { withFileTypes: true })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return []
      }
      throw error
    }

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
    const fromPath = this.resolveInSource(from)
    const toPath = this.resolveInSource(to)

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
    try {
      await access(dirname(path))
    } catch {
      await mkdir(dirname(path), { recursive: true })
    }
  }

  async saveImage(path: string, content: ArrayBuffer): Promise<void> {
    const relativePath = join('images', path)
    const targetPath = this.resolveInSource(relativePath)
    await this.writeFileInternal(targetPath, Buffer.from(content))
  }

  async readFile(path: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    const targetPath = this.resolveInSource(path)
    return readFileFs(targetPath, { encoding })
  }

  async writeFile(
    path: string,
    content: string | ArrayBuffer | Uint8Array,
    encoding: BufferEncoding = 'utf-8',
  ): Promise<void> {
    const targetPath = this.resolveInSource(path)
    if (typeof content === 'string') {
      await this.writeFileInternal(targetPath, content, encoding)
      return
    }
    const buffer =
      content instanceof Uint8Array ? Buffer.from(content) : Buffer.from(new Uint8Array(content))
    await this.writeFileInternal(targetPath, buffer)
  }

  async delete(path: string): Promise<void> {
    const targetPath = this.resolveInSource(path)
    await rm(targetPath, { force: true })
  }

  async getFileInfo(
    path: string,
  ): Promise<{ size: number; createdAt: string; updatedAt: string } | null> {
    const targetPath = this.resolveInSource(path)
    try {
      const result = await stat(targetPath)
      return {
        size: result.size,
        createdAt: result.birthtime.toISOString(),
        updatedAt: result.mtime.toISOString(),
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null
      }
      throw error
    }
  }

  async findAssetReferences(assetPath: string): Promise<string[]> {
    const normalized = assetPath.replace(/\\/g, '/').replace(/^\//, '')
    const results: string[] = []
    const postsRoot = this.resolveInSource('_posts')
    await this.collectReferences(postsRoot, normalized, results)
    return results
  }

  private async collectReferences(
    directory: string,
    searchPath: string,
    results: string[],
  ): Promise<void> {
    let entries: Dirent[] = []
    try {
      entries = await readdir(directory, { withFileTypes: true })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return
      }
      throw error
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        continue
      }
      const fullPath = join(directory, entry.name)
      if (entry.isDirectory()) {
        await this.collectReferences(fullPath, searchPath, results)
        continue
      }
      const extension = extname(entry.name).toLowerCase()
      if (!this.referenceFileExtensions.has(extension)) {
        continue
      }
      let content: string
      try {
        content = await readFileFs(fullPath, { encoding: 'utf-8' })
      } catch {
        continue
      }
      if (content.includes(searchPath) || content.includes('/' + searchPath)) {
        const relativePath = relative(this.sourceDir, fullPath).replace(/\\/g, '/')
        results.push(relativePath)
      }
    }
  }

  private async writeFileInternal(
    path: string,
    content: string | Buffer,
    encoding: BufferEncoding = 'utf-8',
  ): Promise<void> {
    await this.assureDir(path)
    if (typeof content === 'string') {
      await writeFileFs(path, content, { encoding })
      return
    }
    await writeFileFs(path, content)
  }
}

const fsAgent = new FsAgent()

export default fsAgent
