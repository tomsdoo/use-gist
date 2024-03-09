import { CommandBase } from "@/commands/base";
import { Gist } from "@/modules/gist";
import { Params } from "@/modules/params";

const name = "list";

const helpText = `
list gist items

--description
  filter by description

--all-props
  outputs all properties
`;

class ListParams extends Params {
  constructor(options: string[]) {
    super(options, {
      allProps: "boolean",
      description: "string",
    });
  }
  public get allProps() {
    return this.getValue("allProps");
  }
  public get description() {
    return this.getStringValue("description");
  }
}

export class ListCommand extends CommandBase {
  constructor(options: string[]) {
    super(options, {
      name,
      helpText,
    });
  }
  protected async executeCore() {
    const params = new ListParams(this.options);
    const auth = await this.config.readAuth();
    const gist = new Gist(auth);
    const rawItems = await gist.list();
    const filterKeywords = params.description?.toLowerCase().split(" ") ?? [];
    this.debug(filterKeywords);
    const filteredItems = rawItems.filter(item => {
      const itemDescription = item.description?.toLowerCase() ?? "";
      return filterKeywords.every(
        keyword => itemDescription.indexOf(keyword) >= 0
      );
    });
    const items = filteredItems.map(item => {
      if(params.allProps){return item;}else{
        const {id, description, useGistEnabled} = item;
        return {id, description, useGistEnabled};
      }
    });

    await this.output(items);
  }
}
