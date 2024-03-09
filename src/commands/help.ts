import packageJson from "@@/package.json";
import { CommandBase } from "@/commands/base";

const name = "help";

const helpText = `
--help
  show help of this command
`;

const generalHelpText = `
${packageJson.name}@${packageJson.version}

config  : show config
download: download files
exec    : execute script in file
help    : show help
list    : list items
`;

export class HelpCommand extends CommandBase {
  constructor(options: string[]) {
    super(options, {
      name,
      helpText,
    });
  }
  protected async executeCore() {
    console.log(generalHelpText);
  }
}
