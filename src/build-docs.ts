#!/usr/bin/env node
import fsp from "node:fs/promises";
import { processSource } from "@suchipi/dtsmd";
import glomp from "glomp";
import { Path } from "nice-path";
import { run } from "clefairy";
import apiUrls from "./api-urls.json";

run({}, async function main() {
  const rootDir = new Path(__dirname, "..").normalize();

  console.log("build-docs started");

  const dtsFiles = await glomp
    .withExtension(".d.ts")
    .findMatches(rootDir.concat("api").toString());

  for (const fileNameString of dtsFiles) {
    const dtsPath = new Path(fileNameString);

    console.log("processing:", dtsPath.relativeTo(rootDir).toString());

    const dtsSource = await fsp.readFile(dtsPath.toString(), "utf-8");

    const mdResult = await processSource(dtsSource, {
      fileName: fileNameString,
      links: apiUrls,
    });
    for (const warning of mdResult.warnings) {
      console.warn(warning);
    }

    const outputPath = dtsPath.replaceLast(
      dtsPath.basename().replace(/\.d\.ts$/, ".md"),
    );
    await fsp.writeFile(outputPath.toString(), mdResult.markdown);

    console.log("wrote:", outputPath.relativeTo(rootDir).toString());
  }

  console.log("build-docs done");
});
