import Entity from "./entity";
import fs from "fs";
import path from "path";
import program from "commander";
import { genericService, genericInterface } from "./generic";
import Service from "./service";
import Field from "./field";
import { baseService } from "./baseService";

const PROG = "tsstrap";

let entityPackage = "";

program
	.arguments("<entity_package>")
	.action(function (cmd: string) {
		entityPackage = cmd;
	})
	.option("-o, --output <filepath>", "output root path", "./")
	.option("-p, --prefix <string>", "interface declaration name prefix", "")
	.option("-s, --suffix <string>", "interface declaration name suffix", "")
	.option("-S, --services", "generate services")
	.option("-w, --overwrite", "overwrite existing files")
	.parse(process.argv);

if (!fs.existsSync(entityPackage)) {
	process.stderr.write(
		`${PROG}: ${entityPackage}: no such file or directory`,
	);
	program.help();
}

program.output = path.join(program.output, "src");
const servicesTypesPath = path.join(program.output, "@types/services");
const servicesPath = path.join(program.output, "services");
const entityTypesPath = path.join(program.output, "@types/entity");
const domainPath = path.join(entityPackage, "domain");
let enums: string[] = [];
if (fs.existsSync(domainPath))
	enums = fs.readdirSync(domainPath);

fs.mkdirSync(entityTypesPath, {recursive: true});

if (program.services) {
	[servicesPath, servicesTypesPath].forEach(pth => fs.mkdirSync(pth, {recursive: true}));
	const serviceOutputPath = path.join(servicesTypesPath, "GenericService.d.ts");
	const baseServicePath = path.join(servicesPath, "BaseService.ts");
	fs.writeFileSync(serviceOutputPath, genericService());
	fs.writeFileSync(baseServicePath, baseService());
}

const identifiablePath = path.join(entityTypesPath, "Identifiable.d.ts");
fs.writeFileSync(identifiablePath, genericInterface());
fs.readdirSync(entityPackage).forEach((file) => {
	const filepath = path.join(entityPackage, file);
	if (!fs.lstatSync(filepath).isDirectory()) {
		const entity = new Entity(filepath, {suffix: program.suffix || "", prefix: program.prefix || ""});
		const service = new Service(entity);
		entity.fields = entity.fields.map(f => {
			if (!f.isClass) return f;
			if (!enums.some(e => e.startsWith(f.javaType))) return f;
			f.isClass = false;
			f.type = "string";
			return f;
		}) as unknown as Field[];

		const outputPath = path.join(entityTypesPath, entity.fileName + ".d.ts");
		const serviceInterfaceOutputPath = path.join(servicesTypesPath, entity.serviceFileName + ".d.ts");
		const serviceOutputPath = path.join(servicesPath, entity.serviceFileName + ".ts");

		if (!fs.existsSync(outputPath) || program.overwrite) fs.writeFileSync(outputPath, entity.asInterface());
		if ((!fs.existsSync(serviceInterfaceOutputPath) || program.overwrite) && program.services) fs.writeFileSync(serviceInterfaceOutputPath, entity.asService());
		if ((!fs.existsSync(serviceOutputPath) || program.overwrite) && program.services) fs.writeFileSync(serviceOutputPath, service.asService());
	}
});
