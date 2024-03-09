import { CommandBase } from "@/commands/base";
import { Params } from "@/modules/params";
import { Gist } from "@/modules/gist";
import { cwd } from "process";
import { resolve } from "path";

const name = "download";

const helpText = `
--id [gist_id]
  id or description is required, what id to download

--description [description keywords]
  id or description is required, keyword of what item to download

--destination [path]
  where to download
`;

class DownloadParams extends Params {
  constructor(options: string[]) {
    super(options, {
      id: "string",
      description: "string",
      destination: "string",
    });
  }
  public get id() {
    return this.getStringValue("id");
  }
  public get description() {
    return this.getStringValue("description");
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
    if(!params.id && !params.description){
      return;
    }
    const gist = new Gist(await this.config.readAuth());
    const destination = params.destination ? resolve(cwd(), params.destination) : cwd();
    const gistId = params.id ?? (await gist.list().then(items => {
      const keywords = params.description?.toLowerCase()?.split(" ") ?? [];
      const filteredItems = items.filter(item => {
        const itemDescription = item.description?.toLowerCase() ?? "";
        return keywords.every(keyword => itemDescription.indexOf(keyword) >= 0);
      });
      if(filteredItems.length !== 1){
        console.log(`description matches: ${filteredItems.length} items`);
        console.log(filteredItems.map(({description}) => description));
        process.exit();
      }
      return filteredItems[0].id;
    }));
    await gist.download(gistId!, destination, (data) => this.debug(data));
  }
}

