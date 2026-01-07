import { formatPrefix, levelWeight, Logger, LogLevel, normalizeLevel } from './types';

export class ConsoleLogger implements Logger {
  private readonly threshold: number;

  constructor(level?: string | null) {
    const minLevel = normalizeLevel(level);
    this.threshold = levelWeight[minLevel];
  }

  private log(level: LogLevel, ...args: unknown[]) {
    if (levelWeight[level] < this.threshold) {
      return;
    }
    const prefix = formatPrefix(level);
    // Всегда пишем в stderr, чтобы не ломать stdio-transport
    console.error(prefix, ...args);
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
