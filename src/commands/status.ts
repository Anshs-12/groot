import path from "path";
import fs from "fs";
import { readGrootIgnore } from "../utils";
import type { indexJsonFileStructure } from "../utils";
import type { commitStructure } from "../utils";
import crypto from "crypto";
import { dir } from "console";

export function status() {
    // scanning the entire project directory for all the folder/files to be scanned!
    let projectDirArray: string[] = fs.readdirSync(process.cwd());
    console.log(projectDirArray);

    // using a set to reduce lookup time complexity to O(1);
    let grootIgnoreContentSet = new Set<string>(readGrootIgnore());
    console.log(grootIgnoreContentSet);

    let stagingArea: string[] = [];
    let modifiedFile: string[] = [];
    let unTrackedFile: string[] = [];

    projectDirArray.forEach((dirPath) => {
        let dynamicPathOfdirPath: string = path.join(
            process.cwd(),
            `${dirPath}`,
        );

        if (!grootIgnoreContentSet.has(dynamicPathOfdirPath)) {
            if (fs.statSync(dynamicPathOfdirPath).isDirectory()) {
                scanDirectory(dynamicPathOfdirPath);
            } else {
                let checkIndexJsonValue: string | boolean =
                    checkIndexJSON(dynamicPathOfdirPath);
                if (checkIndexJsonValue === "modified") {
                    // this means that this file is not modified and has been added to groot to be committed.
                    modifiedFile.push(dynamicPathOfdirPath);
                } else if (checkIndexJsonValue) {
                    stagingArea.push(dynamicPathOfdirPath);
                } else {
                    // this is when the file is not being added or tracked
                    // that is no staging area at all
                    // Untracked File
                    unTrackedFile.push(dynamicPathOfdirPath);
                }
            }
        }
    });

    printStagingArea(stagingArea);
    printStagingArea(modifiedFile);
    printStagingArea(unTrackedFile);
}

function scanDirectory(dirPath: string): string[] {}

function typeCheck(dynamicPathOfdirPath: string): string {}

function checkIndexJSON(dirPath: string): boolean | string {
    let indexJsonPath: string = path.join(
        process.cwd(),
        ".groot",
        "index.json",
    );

    let receivedFileContent: string = fs.readFileSync(dirPath, "utf-8");

    let receivedFileContentHash: string = crypto
        .createHash("sha256")
        .update(receivedFileContent)
        .digest("hex");

    let indexJsonFileContent: indexJsonFileStructure[] = JSON.parse(
        fs.readFileSync(indexJsonPath, "utf-8"),
    );

    for (let currItem of indexJsonFileContent) {
        if (currItem.file === dirPath) {
            if (currItem.hash === receivedFileContentHash) return true;
            else {
                return "modified";
            }
        }
    }
    return false;
}

function printStagingArea(pathArray: string[]) {
    console.log(`Changes waiting to be committed:`);
    console.log(
        `use \"groot restore --staged <file>...\" to unstage or else groot /help`,
    );
    pathArray.forEach((eachPath) => {
        console.log(`new file: ${eachPath}`);
    });
}

function commitFolderLookup(pathToLook: string): boolean {
    let commitFolderPath: string = path.join(
        process.cwd(),
        ".groot",
        "commits",
    );
    let commitFolderContent: string[] = fs.readdirSync(commitFolderPath);

    commitFolderContent.forEach((eachCommitId) => {
        let eachCommitPath: string = path.join(
            process.cwd(),
            ".groot",
            "commits",
            eachCommitId + ".json",
        );

        let eachCommitContent: commitStructure = JSON.parse(eachCommitPath);

        eachCommitContent.files;
    });
    return false;
}

status();

/*
    Status works in three ways where groot needs to answer three questions:

    1. are there any files which it has never seen or heard of,
        then it goes into "untracked categories!"
    2. what files are added means which are meant to be commited in the next commit,
        this is "staged category!"
    3. what files did groot see before but now is changed,
        so now it comes under "modified categories(unstaged)!"


    Now the enitre flow:

    Changes not staged for commit:
        When groot status is executed, first the index.json is checked to find out all the
        staged area files which basically were done using add command and are waiting to be commit
        These files would be check and verified with the path & hash(to know the current status)
        of the file, now if the file is present
            if the hash also matches then this file is waiting to be commited and therefore
            would come into the staging area with green color!
        then the file would be go into the staging area for printing.

    Untracked Files:
        this section consists of both the modified and the non staged files.

        Modifiles files would have a prefix as modified: indicating that this file was modified.
        Now suppose you are on a path say index.ts and then you check the commits file to seen
        if this file had been committed before then if its yes then you move on to
        check the newCommitHash===OldCommitHash, if this is true then we skip this otherwise
        if this is false then this file was modified then comes in the printing area with modified tag!

        Untracked files has the similar outflow as the modified files just that its checked if the file was
        ever commited , if it doesn't exists in the commits then its understood that this file was never
        tracked and so there fore would come under untrackedFiles!
        These include gitIgnore even and other set of files and folders!

*/
