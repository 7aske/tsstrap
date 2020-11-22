import fs from "fs";
import { basename } from "path";
import Field from "./field";
import { DEFAULT_OPTS } from "./options";

export default class Entity {
	private fileContents = "";
	private packageName = "";
	private readonly _inputFileName: string;
	private readonly _className: string;
	private readonly _serviceClassName: string;
	private readonly _fileName: string;
	private readonly _serviceFileName: string;
	private static readonly fieldRegex = /^\s*(private|protected|public)\s*([\w<>_]+)\s*([\w_]+);/gm;
	private static readonly packageRegex = /package ([a-zA-Z.]+);/;
	private readonly options;
	private _fields: Field[] = [];

	constructor(filename: string, options = DEFAULT_OPTS) {
		this.options = options;
		this._inputFileName = filename;
		this._fileName = basename(filename).replace(".java", "");
		this._serviceFileName = basename(filename).replace(".java", "") + "Service";
		this._className = this.options.prefix + this._fileName + this.options.suffix;
		this._serviceClassName = this.options.prefix + this._fileName + "Service" + this.options.suffix;
		this.parse();
	}

	private loadFile() {
		if (!fs.existsSync(this._inputFileName)) throw `file ${this._inputFileName} not found`;

		this.fileContents = fs.readFileSync(this._inputFileName).toString();
	}

	private parse() {
		if (!this.fileContents) this.loadFile();
		const parts = this.fileContents.match(Entity.packageRegex);
		this.packageName = parts ? parts[1] : "";
		const fieldLines = this.fileContents.match(Entity.fieldRegex);
		this._fields = fieldLines ? fieldLines.map(f => new Field(f, this.options)) : [];
	}

	get fields(): Field[] {
		return this._fields;
	}

	set fields(value: Field[]) {
		this._fields = value;
	}

	public get fileName(): string {
		return this._fileName;
	}

	public get className(): string {
		return this._className;
	}

	public get serviceClassName(): string {
		return this._serviceClassName;
	}

	public get serviceFileName(): string {
		return this._serviceFileName;
	}

	public asInterface(): string {
		let out = "import { Identifiable } from \"./Identifiable\";\n";
		this._fields.forEach(f => {
			let type = f.type.replace("[]", "");
			let field = type.substring(this.options.prefix!.length, type.length - this.options.suffix!.length);
			if (f.isClass) {
				if (out.indexOf(type) === -1) {
					out += `import { ${type} } from  "./${field}"\n`;
				}
			}
		});
		out += `\nexport interface ${this._className} extends Identifiable {\n\t${this._fields.map(f => f.asTSField()).join("\n\t")}\n}`;
		return out;
	}

	public asService(): string {
		let out =
			`import { IGenericService } from "./GenericService";\n` +
			`import { ${this._className} } from "../entity/${this._fileName}";\n`;
		out += `\nexport interface ${this._serviceClassName}  extends IGenericService<${this._className}> {}`;
		return out;
	}
}
