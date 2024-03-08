import packageJson from "@@/package.json";
import { Params } from "@/modules/params";

export interface CommandConfig {
  name: string;
  helpText: string;
}

export class CommandBase {
  protected name: string;
  protected params: Params;
  protected helpText: string;
  constructor(options: string[], { name, helpText }: CommandConfig) {
    this.name = name;
    this.helpText = helpText;
    this.params = new Params(options);
  }
  public async showHelp() {
    const commandLine = `${packageJson.name} ${this.name}`;
    console.log([commandLine, "", this.helpText.split("\n").map(line => `\t${line}`).join("\n")].join("\n"));
  }
  public async execute() {
    if(this.params.help) {
      await this.showHelp();
      return;
    }
    await this.executeCore();
  }
  protected async executeCore() {
    // nop
  }
}
