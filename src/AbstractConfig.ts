import { writeFileSync, rmSync, existsSync } from 'node:fs';

export abstract class AbstractConfig {
  private readonly path: string;

  constructor(configPath: string) {
    this.path = configPath;
  }

  abstract apply(content?: string): void;

  public write(content: string): void {
    writeFileSync(this.path, content, { flag: 'w', encoding: 'utf-8' });
  }

  public delete(): void {
    if (existsSync(this.path)) {
      rmSync(this.path);
    }
  }
}
