import { CommandBase } from "@/commands/base";
import { Gist } from "@/modules/gist";
import { Params } from "@/modules/params";

const name = "list";

const helpText = `
list gist items

--all-props
  outputs all properties
`;

class ListParams extends Params {
  constructor(options: string[]) {
    super(options, {
      allProps: "boolean",
    });
  }
  public get allProps() {
    return this.getValue("allProps");
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
    const items = await gist.list().then(items => items.map(item => {
      if(params.allProps){return item;}else{
        const {id, description} = item;
        return {id, description};
      }
    }))

    await this.output(items);
  }
}
