import Entity from "./entity";
import fs from "fs";
import path from "path";

fs.readdirSync("test").forEach(file => {
	const e = new Entity(path.join("test", file));
	e.saveToFile("out");
});


