import Entity from "./entity";
import fs from "fs";
import path from "path";
import program from "commander";
import { genericService } from "./genericService";
import Service from "./service";

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

fs.mkdirSync(entityTypesPath, {recursive: true});

if (program.services) {
	[servicesPath, servicesTypesPath].forEach(pth => fs.mkdirSync(pth, {recursive: true}));
	const serviceOutputPath = path.join(servicesTypesPath, "GenericService.d.ts");
	fs.writeFileSync(serviceOutputPath, genericService());
}

fs.readdirSync(entityPackage).forEach((file) => {
	const filepath = path.join(entityPackage, file);
	if (!fs.lstatSync(filepath).isDirectory()) {
		const entity = new Entity(filepath, {suffix: program.suffix || "", prefix: program.prefix || ""});
		const service = new Service(entity);
		const outputPath = path.join(entityTypesPath, entity.fileName + ".d.ts");
		const serviceInterfaceOutputPath = path.join(servicesTypesPath, entity.serviceFileName + ".d.ts");
		const serviceOutputPath = path.join(servicesPath, entity.serviceFileName + ".ts");

		if (!fs.existsSync(outputPath) || program.overwrite) fs.writeFileSync(outputPath, entity.asInterface());
		if ((!fs.existsSync(serviceInterfaceOutputPath) || program.overwrite) && program.services) fs.writeFileSync(serviceInterfaceOutputPath, entity.asService());
		if ((!fs.existsSync(serviceOutputPath) || program.overwrite) && program.services) fs.writeFileSync(serviceOutputPath, service.asService());
	}
});
