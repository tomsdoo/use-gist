import { CommandBase } from "@/commands/base";
import { Params } from "@/modules/params";
import { Gist } from "@/modules/gist";
import { cwd } from "process";
import { resolve } from "path";

const name = "download";

const helpText = `
--id [gist_id]
  required, what id to download

--destination [path]
  where to download
`;

class DownloadParams extends Params {
  constructor(options: string[]) {
    super(options, {
      id: "string",
      destination: "string",
    });
  }
  public get id() {
    return this.getStringValue("id");
  }
  public get destination() {
    return this.getStringValue("destination");
  }
}

export class DownloadCommand extends CommandBase {
  constructor(options: string[]) {
    super(options, {
      name,
      helpText,
    });
  }
  protected async executeCore() {
    const params = new DownloadParams(this.options);
    if(!params.id){
      return;
    }
    const gist = new Gist(await this.config.readAuth());
    const destination = params.destination ? resolve(cwd(), params.destination) : cwd();
    await gist.download(params.id, destination, (data) => this.debug(data));
  }
}

