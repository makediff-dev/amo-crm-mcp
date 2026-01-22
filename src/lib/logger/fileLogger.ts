import fs from 'node:fs';
import path from 'node:path';

import { formatPrefix, levelWeight, Logger, LogLevel, normalizeLevel } from './types';

export class FileLogger implements Logger {
  private readonly threshold: number;
  private readonly filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();
  private hasLoggedWriteError = false;

  constructor(filePath?: string, level?: string | null) {
    const minLevel = normalizeLevel(level);
    this.threshold = levelWeight[minLevel];
    this.filePath = filePath ?? path.join(process.cwd(), 'mcp.log');
  }

  private appendLine(line: string): void {
    // Chain writes to ensure order and handle errors
    this.writeQueue = this.writeQueue
      .then(() => this.writeToFile(line))
      .catch((err) => {
        // Log write error to stderr once to avoid flooding
        if (!this.hasLoggedWriteError) {
          this.hasLoggedWriteError = true;
          console.error(`FileLogger: Failed to write to ${this.filePath}:`, err);
        }
      });
  }

  private writeToFile(line: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.appendFile(this.filePath, `${line}\n`, { encoding: 'utf8' }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private log(level: LogLevel, ...args: unknown[]) {
    if (levelWeight[level] < this.threshold) {
      return;
    }
    const prefix = formatPrefix(level);
    const text = [prefix, ...args]
      .map((chunk) => (typeof chunk === 'string' ? chunk : JSON.stringify(chunk)))
      .join(' ');
    this.appendLine(text);
  }

  debug(...args: unknown[]) {
    this.log('debug', ...args);
  }

  info(...args: unknown[]) {
    this.log('info', ...args);
  }

  warn(...args: unknown[]) {
    this.log('warn', ...args);
  }

  error(...args: unknown[]) {
    this.log('error', ...args);
  }

  /**
   * Wait for all pending writes to complete
   * Should be called before process exit to ensure all logs are written
   */
  async flush(): Promise<void> {
    await this.writeQueue;
  }
}
