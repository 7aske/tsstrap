import Entity from "./entity";
import fs from "fs";
import path from "path";
import program from "commander";

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
	.option("-w, --overwrite", "overwrite existing files")
	.parse(process.argv);

if (!fs.existsSync(entityPackage)) {
	process.stderr.write(
		`${PROG}: ${entityPackage}: no such file or directory`,
	);
	program.help();
}

fs.readdirSync(entityPackage).forEach((file) => {
	const filepath = path.join(process.cwd(), entityPackage, file);
	if (!fs.lstatSync(filepath).isDirectory()){
		const e = new Entity(filepath, {suffix:program.suffix || "", prefix: program.prefix || ""});
		if (!fs.existsSync(filepath) || program.overwrite) {
			e.saveToFile(path.join(process.cwd(), program.output));
		}
	}
});
