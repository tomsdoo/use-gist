import packageJson from "@@/package.json";
import { join } from "path";
import { homedir } from "os";
import { readFile, writeFile, stat } from "fs/promises";
import { Coflater } from "@tomsd/coflater";

export interface AppConfig {
  auth: string;
}

export class Config {
  protected initialValue: AppConfig;
  constructor() {
    this.initialValue = {
      auth: "",
    };
  }
  public get fileName() {
    return join(homedir(), `.${packageJson.name}-config.json`);
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
    const coflater = new Coflater<AppConfig>();
    const config = coflater.inflate({
      ...coflater.deflate(this.initialValue),
      ...coflater.deflate(dataRead),
    });
    return config;
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
}

