import { Octokit } from "octokit";

export class Gist {
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
    return darr.flatMap(v => v);
  }

}
