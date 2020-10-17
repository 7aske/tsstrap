import fs from "fs";
import { basename, join } from "path";
import Field from "./field";
import {DEFAULT_OPTS} from "./options";

export default class Entity {
	private fileContents: string;
	private packageName: string = "";
	private table: string = "";
	private className: string = "";
	private fields: Field[] = [];
	private readonly fieldRegex = /^\s*(private|protected|public)\s*([\w<>_]+)\s*([\w_]+);/gm;
	private readonly packageRegex = /package ([a-zA-Z.]+);/;
	private options;

	constructor(filename: string, options = DEFAULT_OPTS) {
		this.options = options;
		this.fileContents = this.loadFile(filename);
		this.className = this.options.prefix + basename(filename).replace(".java", "") + this.options.suffix;
		this.parse();
	}

	private loadFile(fileName: string): string {
		if (!fs.existsSync(fileName)) {
			throw `file ${fileName} not found`;
		}

		return fs.readFileSync(fileName).toString();
	}

	private parse() {
		const parts = this.fileContents.match(this.packageRegex);
		this.packageName = parts ? parts[1] : "";
		const fieldLines = this.fileContents.match(this.fieldRegex);
		this.fields = fieldLines ? fieldLines.map(f => new Field(f, this.options)) : [];
	}

	private asInterface(): string {
		return `export interface ${this.className} {\n\t${this.fields.map(f => f.asTSField()).join("\n\t")}\n }`;
	}

	public saveToFile(dir: string) {
		fs.writeFileSync(join(dir, this.className + ".d.ts"), this.asInterface());
	}
}
