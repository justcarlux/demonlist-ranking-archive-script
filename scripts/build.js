const path = require("node:path");
const fs = require("fs-extra");
const { spawnSync } = require("child_process");

if (!process.argv[2]) {
    return console.log("You need to specify an output directory.");
}

const startedTimestamp = Date.now();
const outputDirectory = path.join(process.cwd(), process.argv[2]);

console.log(`Removing folder...`);
fs.emptyDirSync(outputDirectory);
fs.rmdirSync(outputDirectory);

console.log("Building proyect with tsc...");
spawnSync("npx tsc", { cwd: process.cwd(), shell: true });

console.log("Copying static files...");
const entries = [];
for (const index in entries) {
    const entry = entries[index];
    fs.copySync(path.join(process.cwd(), "src", entry), path.join(outputDirectory, "src", entry));
    console.log(`- Copied: ${entry}`);
}
console.log(`\nBuild finished in ${((Date.now() - startedTimestamp) / 1000).toFixed(1)}s in: ${outputDirectory}`);