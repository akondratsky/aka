import { existsSync, writeFileSync } from 'node:fs';

export abstract class AbstractConfig {
  private readonly path: string;

  constructor(configPath: string) {
    this.path = configPath;
    if (!existsSync(this.path)) {
      console.log(`No config file found: ${this.path}`);
      process.exit(1);
    }
  }

  public write(content: string): void {
    writeFileSync(this.path, content, { flag: 'w', encoding: 'utf-8' });
  }
}
