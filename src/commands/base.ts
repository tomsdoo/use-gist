import packageJson from "@@/package.json";
import { Params } from "@/modules/params";
import { Config } from "@/modules/config";

export interface CommandConfig {
  name: string;
  helpText: string;
}

export class CommandBase {
  protected name: string;
  protected params: Params;
  protected helpText: string;
  protected options: string[];
  protected config: Config;
  constructor(options: string[], { name, helpText }: CommandConfig) {
    this.name = name;
    this.helpText = helpText;
    this.options = options;
    this.params = new Params(options);
    this.config = new Config();
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
  protected async output(data: any) {
    const outputFormat = this.params.format ?? (await this.config.readOutputFormat());
    switch(outputFormat) {
      case "table": {
        console.table(data);
        break;
      }
      default: {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }
  protected debug(data: any) {
    if(this.params.debug){
      console.debug(data);
    }
  }
}
