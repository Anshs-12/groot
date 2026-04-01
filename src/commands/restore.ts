// implementing groot restore --staged
import fs from "fs";
import path from "path";
import { fetchIndexJsonContent, fetchIndexJsonPath } from "../utils";

export function restore(fileNameToUnstaged: string) {
    // console.log(`${path.resolve(fileNameToUnstaged)}`);
    let indexJsonFileContent: Record<string, string> = fetchIndexJsonContent();
    if (indexJsonFileContent[path.resolve(fileNameToUnstaged)] === undefined) {
        console.log(`${fileNameToUnstaged} is not staged`);
        return;
    }
    delete indexJsonFileContent[path.resolve(fileNameToUnstaged)];
    fs.writeFileSync(
        fetchIndexJsonPath(),
        JSON.stringify(indexJsonFileContent, null, 2),
    );
}
/*
    wokring:
        groot restore --staged works by removing the file from the
        index.json as reach time when status() is called it gets the
        rigth content to be committed.

        If we remove from the stagedArray then this would result
        in a temporary fix which wouldn't be useful when again
        status is called!
*/
