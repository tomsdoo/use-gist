function toKebabCase(str: string) {
	if (typeof str !== 'string') return str;

	str = str.replace(/^ *?[A-Z]/, function(allStr) { return allStr.toLowerCase(); });
	str = str.replace(/_/g, '-');
	str = str.replace(/ *?[A-Z]/g, function(allStr, i) { return '-' + allStr.replace(/ /g, '').toLowerCase(); });
	return str;
}

export class Params {
  protected options: string[];
  protected definitions: Record<string, string>;
  constructor(options: string[], definitions?: Record<string, string>) {
    this.options = options;
    this.definitions = {
      help: "boolean",
      debug: "boolean",
      format: "string",
      ...(definitions ?? {}),
    };
  }
  public get help() {
    return this.getValue("help");
  }
  public get debug() {
    return this.getValue("debug");
  }
  public get format() {
    return this.getStringValue("format");
  }
  protected getValue(name: string) {
    if(!(name in this.definitions)) {
      return undefined;
    }
    const optionName = `--${toKebabCase(name)}`;
    switch(this.definitions[name]) {
      case "boolean": {
        return this.options.includes(optionName);
      }
      default: {
        const localOptions = this.options.slice();
        const foundIndex = localOptions.findIndex(s => s === optionName);
        if(foundIndex === -1){
          return undefined;
        }
        const [_,value] = localOptions.splice(foundIndex, 2);
        return value;
      }
    }
  }
  protected getStringValue(name: string): string | undefined {
    const value = this.getValue(name);
    if(typeof value === "string") {
      return value;
    }else{return;}
  }
}