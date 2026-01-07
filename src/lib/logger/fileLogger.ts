import fs from 'fs';
import path from 'path';

import { formatPrefix, levelWeight, Logger, LogLevel, normalizeLevel } from './types';

export class FileLogger implements Logger {
  private readonly threshold: number;
  private readonly filePath: string;

  constructor(filePath?: string, level?: string | null) {
    const minLevel = normalizeLevel(level);
    this.threshold = levelWeight[minLevel];
    this.filePath = filePath ?? path.join(process.cwd(), 'mcp.log');
  }

  private appendLine(line: string) {
    fs.appendFile(this.filePath, `${line}\n`, { encoding: 'utf8' }, () => {});
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
}
