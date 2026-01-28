import { readFileSync } from 'node:fs';
import path from 'node:path';

export interface ServerConfig {
  name: string;
  version: string;
  description?: string;
}

export interface LoadServerConfigOptions {
  /**
   * Path to package.json file. If not provided, will search from process.cwd()
   */
  packageJsonPath?: string;
  /**
   * Fallback name if not found in package.json
   */
  defaultName?: string;
  /**
   * Fallback version if not found in package.json
   */
  defaultVersion?: string;
}

export function loadServerConfig(options?: LoadServerConfigOptions): ServerConfig {
  let packageJsonPath = options?.packageJsonPath;

  if (!packageJsonPath) {
    // Try current working directory first (for Cursor MCP with cwd set)
    const cwdPath = path.resolve(process.cwd(), 'package.json');
    try {
      readFileSync(cwdPath, 'utf-8');
      packageJsonPath = cwdPath;
    } catch {
      // If not found, try project root (go up from dist/lib/utils to project root)
      const distDir = __dirname.replace(/[/\\]lib[/\\]utils$/, '');
      const projectRoot = path.resolve(distDir, '..');
      packageJsonPath = path.resolve(projectRoot, 'package.json');
    }
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
    name?: string;
    version?: string;
    description?: string;
  };

  return {
    name: packageJson.name ?? options?.defaultName ?? 'mcp-server',
    version: packageJson.version ?? options?.defaultVersion ?? '0.0.0',
    description: packageJson.description,
  };
}
