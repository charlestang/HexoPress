import { isAbsolute, relative, resolve, sep } from 'node:path'

/**
 * Resolve a user-supplied, relative path against a trusted base directory and
 * guarantee the result stays inside that base. This is the single audited
 * path-traversal barrier shared by every filesystem-facing service
 * (HexoContext, FsAgent, ...).
 *
 * The guard is written with a sanitizer pattern that static analyzers
 * (CodeQL's `js/path-injection`) recognize: after resolving, the path relative
 * to the base must not be absolute and must not start with a `..` segment. A
 * recognized barrier means the alerts are genuinely cleared rather than
 * suppressed.
 *
 * @param baseDir Trusted base directory (e.g. Hexo `source_dir` / `base_dir`).
 * @param userPath Untrusted relative path coming from the renderer / HTTP API.
 * @returns The absolute, validated path guaranteed to live within `baseDir`.
 * @throws Error if the input is empty, malformed, or escapes `baseDir`.
 */
export function resolveWithin(baseDir: string, userPath: string): string {
  if (typeof userPath !== 'string' || userPath.length === 0) {
    throw new Error('Path must be a non-empty string')
  }

  // Reject NUL bytes outright (poison-null-byte attacks truncate paths in some
  // native fs calls before the traversal check can run).
  if (userPath.includes('\0')) {
    throw new Error('Path contains invalid characters')
  }

  // Reject absolute inputs early: they would override the base directory.
  if (isAbsolute(userPath)) {
    throw new Error(`Path traversal detected: ${userPath}`)
  }

  const base = resolve(baseDir)
  const resolved = resolve(base, userPath)
  const rel = relative(base, resolved)

  // rel === '' means resolved === base (the directory itself), which is allowed.
  // Anything that climbs above the base ('..', '../foo') or is absolute escapes.
  if (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) {
    throw new Error(`Path traversal detected: ${userPath}`)
  }

  return resolved
}
