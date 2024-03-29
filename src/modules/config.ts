import packageJson from "@@/package.json";
import { join } from "path";
import { homedir } from "os";
import { readFile, writeFile, stat } from "fs/promises";
import { Coflater } from "@tomsd/coflater";

export interface AppConfig {
  auth: string;
  preferences: {
    output: {
      format: string;
    };
  };
}

export class Config {
  protected coflater: Coflater<AppConfig>;
  protected initialValue: AppConfig;
  constructor() {
    this.initialValue = {
      auth: "",
      preferences: {
        output: {
          format: "json",
        },
      },
    };
    this.coflater = new Coflater<AppConfig>;
  }
  public get fileName() {
    return join(homedir(), `.${packageJson.name.replace(/^@.+\//, "")}-config.json`);
  }
  protected  async ensureFile() {
    await stat(this.fileName).catch(async () => {
      await writeFile(this.fileName, JSON.stringify(this.initialValue, null, 2), { encoding: "utf8"});
    });
  }
  protected async read() {
    await this.ensureFile();
    const content = await readFile(this.fileName, { encoding: "utf8"});
    const dataRead = JSON.parse(content);
    const config = this.coflater.inflate({
      ...this.coflater.deflate(this.initialValue),
      ...this.coflater.deflate(dataRead),
    });
    return config;
  }
  public async readAll() {
    return await this.read();
  }
  public async readAuth() {
    return await this.read().then(({ auth }) => auth);
  }
  public async writeAuth(auth: string) {
    const config = await this.read();
    await writeFile(this.fileName, JSON.stringify({
      ...config,
      auth,
    }, null, 2),{ encoding: "utf8"});
  }
  public async readOutputFormat() {
    return await this.read().then(({ preferences: { output: { format }}}) => format);
  }
  public async writeOutputFormat(format: string) {
    const config = await this.read();
    const nextConfig = this.coflater.inflate({
      ...this.coflater.deflate(config),
      ...this.coflater.deflate({
        preferences: {
          output: {
            format,
          },
        },
      }),
    });
    await writeFile(this.fileName, JSON.stringify(nextConfig, null, 2), { encoding: "utf8"});
  }
}

