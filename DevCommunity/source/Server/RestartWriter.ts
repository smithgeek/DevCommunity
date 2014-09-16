import fs = require('fs');

export function writeRestartFile(message: string): void {
    fs.writeFileSync("site/restart.js", message);
}

if (process.argv.length >= 3 && process.argv[2] == "--init") {
    writeRestartFile("creating file");
}