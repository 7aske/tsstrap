import { DEFAULT_OPTS } from "./options";

export const enum AccessModifier {
	PRIVATE = "private",
	PUBLIC = "public",
	PROTECTED = "protected",
}

export default class Field {
	private modifier: AccessModifier;
	private readonly _type: string;
	private readonly name: string;
	private _isClass = false;
	private options;

	constructor(line: string, options = DEFAULT_OPTS) {
		this.options = options;
		const fieldRegex = /^\s*(private|protected|public)\s*([\w_<>]+)\s*([\w_]+);/;
		const parts = line.trim().match(fieldRegex);
		if (parts) {
			this.modifier = parts[1] as AccessModifier;
			let type = parts[2];
			if (type.startsWith("List")) {
				type = type.match(/List<([\w]*)>/)![1] + "[]";
			} else if (type.startsWith("Set")) {
				type = type.match(/Set<([\w]*)>/)![1] + "[]";
			}

			this._type = this.typeConv(type);
			this.name = parts[3];
		} else {
			throw `cannot parse ${line} as Field`;
		}
	}

	public get isClass(): boolean {
		return this._isClass;
	}

	public get type(): string {
		return this._type;
	}

	public asTSField() {
		if(this.isClass){
			return `${this.name}: ${this._type}|number;`;
		} else {
			return `${this.name}: ${this._type};`;
		}
	}

	private typeConv(type: string): string {
		switch (type) {
			case "Integer":
			case "Long":
			case "Double":
			case "Float":
			case "Short":
			case "double":
			case "float":
			case "int":
			case "short":
				return "number";
			case "String":
				return "string";
			case "Boolean":
			case "boolean":
			case "bool":
				return "boolean";
			case "Date":
			case "LocalDate":
			case "LocalDateTime":
				return "Date";
			default:
				this._isClass = true;
				return this.options.prefix + type + this.options.suffix;
		}
	}
}
