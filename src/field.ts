import { DEFAULT_OPTS } from "./options";

export const enum AccessModifier {
	PRIVATE = "private",
	PUBLIC = "public",
	PROTECTED = "protected",
}

export default class Field {
	private modifier: AccessModifier;
	private _type: string;
	private _javaType: string;
	private _name: string;
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

			this._javaType = type;
			this._type = this.typeConv(type);
			this._name = parts[3];
		} else {
			throw `cannot parse ${line} as Field`;
		}
	}

	public get isClass(): boolean {
		return this._isClass;
	}

	public set isClass(value: boolean) {
		this._isClass = value;
	}

	public asTSField() {
		return `${this._name}: ${this._type};`;
	}

	public get javaType(): string {
		return this._javaType;
	}

	public set javaType(value: string) {
		this._javaType = value;
	}

	public get name(): string {
		return this._name;
	}

	public set name(value: string) {
		this._name = value;
	}

	public get type(): string {
		return this._type;
	}

	public set type(value: string) {
		this._type = value;
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
