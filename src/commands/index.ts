import { HelpCommand } from "@/commands/help";

export async function work() {
  const options = process.argv.slice(2);
  const [command] = options.slice(0,1);
  new ({
    help: HelpCommand
  }[command] ?? HelpCommand)(options).execute();
}
