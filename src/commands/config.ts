import { CommandBase } from "@/commands/base";
import { Config } from "@/modules/config";
import { Params } from "@/modules/params";
import { exec } from "child_process";

const name = "config";

const helpText = `
--edit [editor]
  opens config file with specified editor

--path
  shows config file path

--set-auth [personal access token]
  sets auth

--set-format [json|table]
  sets preference of output format
`;

class ConfigParams extends Params {
  constructor(options: string[]){
    super(options, {
      edit: "string",
      path: "boolean",
      setAuth: "string",
      setFormat: "string",
    });
  }
  public get edit() {
    return this.getStringValue("edit");
  }
  public get path() {
    return this.getValue("path");
  }
  public get setAuth() {
    return this.getStringValue("setAuth");
  }
  public get setFormat() {
    return this.getStringValue("setFormat");
  }
}

export class ConfigCommand extends CommandBase {
  constructor(options: string[]) {
    super(options, {
      name,
      helpText,
    });
  }
  protected async executeCore() {
    const params = new ConfigParams(this.options);
    const config = new Config();
    if(params.edit) {
      exec(`${params.edit} ${config.fileName}`, () => {});
    }else if(params.path) {
      console.log(config.fileName);
    }else if(params.setAuth) {
      await config.writeAuth(params.setAuth);
    }else if(params.setFormat) {
      await config.writeOutputFormat(params.setFormat);
    }else {
      await this.output(await config.readAll());
    }
  }
}
