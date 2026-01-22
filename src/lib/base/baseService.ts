import { Logger } from '../logger/types';

/**
 * Base class for services that provides common functionality
 */
export abstract class BaseService {
  protected constructor(protected readonly logger: Logger) {}
}
