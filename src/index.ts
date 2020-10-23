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


if (program.services) {
	const serviceOutputPath = path.join(program.output, "@types/services", "GenericService.d.ts");
	fs.writeFileSync(serviceOutputPath, genericService());
}

fs.readdirSync(entityPackage).forEach((file) => {
	const filepath = path.join(entityPackage, file);
	if (!fs.lstatSync(filepath).isDirectory()) {
		const e = new Entity(filepath, {suffix: program.suffix || "", prefix: program.prefix || ""});
		const s = new Service(e);
		const outputPath = path.join(program.output, "@types/entity", e.fileName + ".d.ts");
		const serviceInterfaceOutputPath = path.join(program.output, "@types/services", e.serviceFileName + ".d.ts");
		const serviceOutputPath = path.join(program.output, "services", e.serviceFileName + ".ts");

		if (!fs.existsSync(outputPath) || program.overwrite) fs.writeFileSync(outputPath, e.asInterface());
		if ((!fs.existsSync(serviceInterfaceOutputPath) || program.overwrite) && program.services) fs.writeFileSync(serviceInterfaceOutputPath, e.asService());
		if ((!fs.existsSync(serviceOutputPath) || program.overwrite) && program.services) fs.writeFileSync(serviceOutputPath, s.asService());
	}
});
