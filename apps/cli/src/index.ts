#!/usr/bin/env bun
import { createCLI } from "@bunli/core";
import songCommand from "./commands/song";

const cli = await createCLI({
	name: "cli",
	version: "0.1.0",
	description: "A CLI built with Bunli",
});

cli.command(songCommand);

await cli.run();
