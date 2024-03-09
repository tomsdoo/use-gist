import { CommandBase } from "@/commands/base";
import { Params } from "@/modules/params";
import { Gist } from "@/modules/gist";

const name = "exec";

const helpText = `
--id
  id or description is required, gist id

--description
  id or description is required, gist description

--procedure
  procedure name to be executed
`;

class ExecParams extends Params {
  constructor(options: string[]) {
    super(options, {
      id: "string",
      description: "string",
      procedure: "string",
    });
  }
  public get id() {
    return this.getStringValue("id");
  }
  public get description() {
    return this.getStringValue("description");
  }
  public get procedure() {
    return this.getStringValue("procedure");
  }
}

export class ExecCommand extends CommandBase {
  constructor(options: string[])   {
    super(options, {
      name,
      helpText,
    });
  }
  protected async executeCore() {
    const params = new ExecParams(this.options);
    if(!params.id && !params.description){
      console.log("id or description is required");
      process.exit();
    }
    const gist = new Gist(await this.config.readAuth());
    const gistId = params.id ?? (await gist.getOneId(params.description!));
    if(!gistId){
      console.log("file could not be found as just one file");
      return;
    }
    if(params.procedure){
      await this.output(await gist.execute(gistId, params.procedure));
    }else{
      await this.output(await gist.getProcedures(gistId));
    }
  }
}

