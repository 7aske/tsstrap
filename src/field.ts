export const enum AccessModifier {
	PRIVATE = "private",
	PUBLIC = "public",
	PROTECTED = "protected",
}

export default class Field {
	modifier: AccessModifier;
	type: string;
	name: string;

	constructor(line: string) {
		const fieldRegex = /^\s*(private|protected|public)\s*([\w_<>]+)\s*([\w_]+);/;
		const parts = line.trim().match(fieldRegex);
		if (parts) {
			this.modifier = parts[1] as AccessModifier;
			let type = parts[2];
			if (type.startsWith("List")) {
				type = type.match(/List<([\w]*)>/)![1] + "[]";
			}

			this.type = Field.typeConv(type);
			this.name = parts[3];
		} else {
			throw `cannot parse ${line} as Field`;
		}

	}

	public asTSField() {
		return `${this.name}: ${this.type};`;
	}

	static typeConv(type: string): string {
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
				return "I" + type;
		}
	}
}
