import { ConfigCommand } from "@/commands/config";
import { ExecCommand } from "@/commands/exec";
import { DownloadCommand } from "@/commands/download";
import { HelpCommand } from "@/commands/help";
import { ListCommand } from "@/commands/list";

export async function work() {
  const options = process.argv.slice(2);
  const [command] = options.slice(0,1);
  new ({
    config: ConfigCommand,
    download: DownloadCommand,
    exec: ExecCommand,
    help: HelpCommand,
    list: ListCommand,
  }[command] ?? HelpCommand)(options).execute();
}
