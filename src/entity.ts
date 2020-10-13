import fs, { existsSync } from "fs";
import { basename, join } from "path";
import Field from "./field";

export default class Entity {
	private fileContents: string;
	packageName: string = "";
	table: string = "";
	className: string = "";
	fields: Field[] = [];

	constructor(filename: string) {
		this.fileContents = this.loadFile(filename);
		this.className = "I" + basename(filename).replace(".java", "");
		this.parse();
	}

	private loadFile(fileName: string): string {
		if (!existsSync(fileName)) {
			throw `file ${fileName} not found`;
		}
		return fs.readFileSync(fileName).toString();
	}

	private parse() {
		const fieldRegex = /^\s*(private|protected|public)\s*([\w<>_]+)\s*([\w_]+);/gm;
		const parts = this.fileContents.match(/package ([a-zA-Z.]+);/);
		this.packageName = parts ? parts[1] : "";
		const fieldLines = this.fileContents.match(fieldRegex);
		this.fields = fieldLines ? fieldLines.map(f => new Field(f)) : [];
	}

	private asInterface(): string {
		return `declare interface ${this.className} {\n\t${this.fields.map(f => f.asTSField()).join("\n\t")}\n }`;
	}

	public saveToFile(dir: string) {
		fs.writeFileSync(join(dir, this.className + ".d.ts"), this.asInterface());
	}
}
