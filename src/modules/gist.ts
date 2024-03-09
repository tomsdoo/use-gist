import { Octokit } from "octokit";
import { writeFile } from "fs/promises";
import { join } from "path";

export class Gist {
  public static USE_GIST_JSON = "use-gist.json";
  protected auth: string;
  constructor(auth: string) {
    this.auth = auth;
  }
  protected get octokit() {
    return new Octokit({ auth: this.auth });
  }
  public async list() {
    const per_page = 30;
    let page = 1;
    const darr = [];
    while(true) {
      const { data } =  await this.octokit.rest.gists.list({ per_page, page});
      darr.push(data);
      if(data.length === 0) {
        break;
      }
      page++;
    }
    return darr.flatMap(v => v).map(item => ({
      ...item,
      useGistEnabled: item.files?.[Gist.USE_GIST_JSON] != null,
    }));
  }
  public async getItem(id: string) {
    const { data } = await this.octokit.rest.gists.get({ gist_id: id });
    return data;
  }
  public async download(id: string, destination: string, progressMessage: ((data: any) => void) = (() => {}) ) {
    const item = await this.getItem(id);
    if(!item){
      throw new Error(`no giist item is found that is identified with ${id}`);
    }
    progressMessage(`${item.id}: ${item?.description}`);
    if(item?.files?.[Gist.USE_GIST_JSON] == null){
      throw new Error("use-gist.json is not found");
    }
    const useGistJson = JSON.parse(item.files?.[Gist.USE_GIST_JSON]?.content ?? "{}");
    progressMessage(JSON.stringify(useGistJson,null,2));
    for(const file of useGistJson?.files ?? []) {
      progressMessage(file);
      const fileObj = item.files?.[file];
      if(!fileObj){continue;}
      const { type: mimeType, raw_url, content } = fileObj;
      progressMessage({ mimeType, url: raw_url });
      const destinationPath = join(destination, file);
      if(raw_url) {
        const buff = await fetch(raw_url).then(r => r.arrayBuffer()).then(buff => Buffer.from(buff));
        await writeFile(destinationPath, buff);
      }else if(mimeType && content && mimeType.match(/^text\//)){
        await writeFile(destinationPath, content, { encoding: "utf8"});
      }
    }
  }
}
