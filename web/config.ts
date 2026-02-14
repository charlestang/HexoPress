import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomBytes } from 'node:crypto'

export type WebConfig = {
  hexoDir: string
  port: number
  username: string
  password: string
  secret: string
}

type RawConfig = {
  hexoDir?: string
  port?: number
  username?: string
  password?: string
  secret?: string
}

const DEFAULT_CONFIG_NAME = 'hexopress.config.json'

/**
 * Resolve the config file path from CLI args, env var, or default location.
 */
function resolveConfigPath(): string {
  // Check CLI args: --config <path>
  const args = process.argv.slice(2)
  const configIndex = args.indexOf('--config')
  if (configIndex !== -1 && args[configIndex + 1]) {
    return resolve(args[configIndex + 1])
  }

  // Check env var
  if (process.env.HEXOPRESS_CONFIG) {
    return resolve(process.env.HEXOPRESS_CONFIG)
  }

  // Default: look in cwd
  return resolve(process.cwd(), DEFAULT_CONFIG_NAME)
}

/**
 * Load and validate the web server configuration.
 */
export function loadConfig(): WebConfig {
  const configPath = resolveConfigPath()

  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`)
  }

  let raw: RawConfig
  try {
    const content = readFileSync(configPath, 'utf-8')
    raw = JSON.parse(content) as RawConfig
  } catch (error) {
    throw new Error(`Failed to parse config file: ${configPath} - ${error}`)
  }

  if (!raw.hexoDir) {
    throw new Error('Config "hexoDir" is required')
  }

  if (!raw.username || !raw.password) {
    throw new Error('Config "username" and "password" are required')
  }

  return {
    hexoDir: resolve(raw.hexoDir),
    port: raw.port ?? 4000,
    username: raw.username,
    password: raw.password,
    secret: raw.secret || randomBytes(32).toString('hex'),
  }
}
