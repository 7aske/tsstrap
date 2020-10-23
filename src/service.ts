import Entity from "./entity";
import { camelToKebab } from "./util";

export default class Service {
	private readonly _entity: Entity;

	constructor(entity: Entity) {
		this._entity = entity;
	}

	public asService() {
		let endpoint = camelToKebab(this._entity.fileName);
		if (endpoint.endsWith("s")) {
			endpoint = endpoint + "es";
		} else if (endpoint.endsWith("y")) {
			endpoint = endpoint.substring(0, endpoint.length - 1) + "ies";
		} else {
			endpoint = endpoint + "s";
		}

		return `
import BaseService from "./BaseService";
import { ${this._entity.serviceClassName} } from "../@types/services/${this._entity.serviceFileName}";
import { ${this._entity.className} } from "../@types/entity/${this._entity.fileName}";

export default class ${this._entity.fileName}Service extends BaseService implements ${this._entity.serviceClassName} {
	constructor() {
		super("/${endpoint}");
	}
	async getAll(): Promise<${this._entity.className}[]> {
		return (await super.get("/")).data;
	}

	async save(entity: ${this._entity.className}): Promise<${this._entity.className}> {
		return (await super.post("/", entity)).data;
	}

	async update(entity: ${this._entity.className}): Promise<${this._entity.className}> {
		return (await super.put("/", entity)).data;
	}

	async deleteById(id: number): Promise<boolean> {
		return (await super.delete(\`/\${id}\`)).data;
	}
}`;
	}
}
