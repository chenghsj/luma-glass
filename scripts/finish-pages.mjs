import { writeFile } from "node:fs/promises";
await writeFile("docs/.nojekyll", "");
console.log("Production React demo built in docs/; commit docs/ to publish without custom Actions.");
