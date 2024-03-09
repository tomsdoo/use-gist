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
  public async getOneId(keyword: string) {
    const keys = keyword.toLowerCase().split(/\s+/);
    const items = await this.list();
    const filteredItems = items.filter(({description}) => {
      const itemDescription = description?.toLowerCase() ?? "";
      return keys.every(key => itemDescription.indexOf(key) >= 0);
    });
    return filteredItems.length === 1 ? filteredItems[0].id : undefined;
  }
  public async getItem(id: string) {
    const { data } = await this.octokit.rest.gists.get({ gist_id: id });
    return data;
  }
  public async getStructuredItem(id: string) {
    const item = await this.getItem(id);
    return {
      item,
      useGistJson: JSON.parse(item?.files?.[Gist.USE_GIST_JSON]?.content ?? "null"),
    };
  }
  public async ensureStructuredItem(id: string) {
    const result = await this.getStructuredItem(id);
    if(!result.item){
      throw new Error(`no giist item is found that is identified with ${id}`);
    }
    if(!result.useGistJson){
      throw new Error("use-gist.json is not found");
    }
    return result;
  }
  public async download(id: string, destination: string, progressMessage: ((data: any) => void) = (() => {}) ) {
    const {item, useGistJson} = await this.ensureStructuredItem(id);
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
  public async getProcedures(id: string) {
    const {useGistJson} = await this.ensureStructuredItem(id);
    return useGistJson?.procedures ?? {};
  }
  public async execute(id: string, procedure: string) {
    const {item, useGistJson} = await this.ensureStructuredItem(id);
    const file = useGistJson?.procedures?.[procedure];
    if(!file){
      throw new Error(`procedure ${procedure} not defined`);
    }
    const content = item?.files?.[file]?.content;
    if(!content){
      throw new Error(`file ${file} not found`);
    }
    const proc = new (Object.getPrototypeOf(async () => null).constructor)([], content);
    return await proc();
  }
}
