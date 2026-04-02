import path from "path";
import fs from "fs";
import { readGrootIgnore, fetchGrootPath } from "../utils";
import type { indexJsonFileStructure, commitStructure } from "../utils";
import crypto from "crypto";

let stagingArea: string[] = [];
let modifiedFile: string[] = [];
let unTrackedFile: string[] = [];

export function status() {
    stagingArea = [];
    modifiedFile = [];
    unTrackedFile = [];
    let grootIgnoreContentSet = new Set<string>(readGrootIgnore());

    let indexJsonPath: string = path.join(
        fetchGrootPath(),
        ".groot",
        "index.json",
    );

    let grootFolderPath: string = fetchGrootPath();
    let headJsonContent: string = JSON.parse(
        fs.readFileSync(
            path.join(grootFolderPath, ".groot", `HEAD.json`),
            "utf-8",
        ),
    );

    let allSnapShots: Record<string, string> = {};
    if (headJsonContent !== null) {
        let headCommitContent: commitStructure = JSON.parse(
            fs.readFileSync(
                path.join(
                    grootFolderPath,
                    ".groot",
                    "commits",
                    `${headJsonContent}.json`,
                ),
                "utf-8",
            ),
        );
        allSnapShots = headCommitContent.snapshot;
    }

    // retri IndexJsonRecord for faster lookup rather than looping again and again.
    let indexJsonRecord: Record<string, string> = JSON.parse(
        fs.readFileSync(indexJsonPath, "utf-8"),
    );
    scanDirectory(
        grootFolderPath,
        grootIgnoreContentSet,
        indexJsonRecord,
        allSnapShots,
    );

    // checking if the arrays are empty which would lead to nothing to commit, working tree clean.
    if (
        stagingArea.length === 0 &&
        modifiedFile.length === 0 &&
        unTrackedFile.length === 0
    ) {
        printEmptyStagingArea();
    }

    printStagingArea(stagingArea);
    printModifiedFiles(modifiedFile);
    printUntrackedFiles(unTrackedFile);
}

// this function returns the array of total files contained in the folder!
function scanDirectory(
    dirPath: string,
    grootIgnoreContentSet: Set<string>,
    indexJsonRecord: Record<string, string>,
    allSnapShots: Record<string, string>,
) {
    // scanning the entire project directory for all the folder/files to be scanned!
    let projectDirArray: string[] = fs.readdirSync(dirPath);

    // using a set to reduce lookup time complexity to O(1);

    projectDirArray.forEach((eachPath) => {
        let dynamicPathOfdirPath: string = path.join(dirPath, eachPath);

        if (!grootIgnoreContentSet.has(path.basename(dynamicPathOfdirPath))) {
            if (fs.statSync(dynamicPathOfdirPath).isDirectory()) {
                scanDirectory(
                    dynamicPathOfdirPath,
                    grootIgnoreContentSet,
                    indexJsonRecord,
                    allSnapShots,
                );
            } else {
                let receivedFileContent: string = fs.readFileSync(
                    dynamicPathOfdirPath,
                    "utf-8",
                );

                let receivedFileContentHash: string = crypto
                    .createHash("sha256")
                    .update(receivedFileContent)
                    .digest("hex");

                let dynamicFileContent: indexJsonFileStructure = {
                    file: dynamicPathOfdirPath,
                    hash: receivedFileContentHash,
                };

                let checkIndexJsonValue: string | boolean = checkIndexJSON(
                    dynamicFileContent,
                    indexJsonRecord,
                );
                if (checkIndexJsonValue === "modified") {
                    // this means that this file is not modified and has been added to groot to be committed.
                    modifiedFile.push(dynamicFileContent.file);
                } else if (checkIndexJsonValue) {
                    stagingArea.push(dynamicFileContent.file);
                } else {
                    // this is when the file is not being added or tracked
                    // that is no staging area at all
                    // Untracked File
                    let checkCommitSnapshotValue: string | boolean =
                        checkCommitSnapshot(dynamicFileContent, allSnapShots);
                    if (checkCommitSnapshotValue === "modified") {
                        modifiedFile.push(dynamicFileContent.file);
                    } else if (checkCommitSnapshotValue === "untracked") {
                        unTrackedFile.push(dynamicFileContent.file);
                    }
                }
            }
        }
    });
}

function checkIndexJSON(
    dynamicFileContent: indexJsonFileStructure,
    indexJsonRecord: Record<string, string>,
): boolean | string {
    let currFileHash: string | undefined =
        indexJsonRecord[dynamicFileContent.file];
    if (currFileHash !== undefined) {
        if (currFileHash === dynamicFileContent.hash) {
            return true;
        } else {
            return "modified";
        }
    }
    return false;
}

function checkCommitSnapshot(
    dynamicFileContent: indexJsonFileStructure,
    allSnapShots: Record<string, string>,
): boolean | string {
    // no need for let x: indexJsonFileStructure as its an error
    // and TypeScript already inherits the type of the value its being iterated on
    // So in this case x gets the type indexJsonFileStructure

    // implementing O(1) lookup using record!

    let snapShotHash: string | undefined =
        allSnapShots[dynamicFileContent.file];
    if (snapShotHash !== undefined) {
        if (snapShotHash === dynamicFileContent.hash) {
            return false;
        } else {
            return "modified";
        }
    }
    return "untracked";
}

// printing status

function printEmptyStagingArea() {
    console.log(`nothing to commit, working tree clean`);
}

function printStagingArea(pathArray: string[]) {
    if (pathArray.length === 0) return;
    console.log(`Changes waiting to be committed:`);
    console.log(
        `use \"groot restore --staged <file>...\" to unstage or else groot /help`,
    );
    pathArray.forEach((eachPath) => {
        console.log(
            `        \x1b[38;2;160;213;133mnew file: ${eachPath}\x1b[0m`,
        );
    });
}

function printUntrackedFiles(pathArray: string[]) {
    if (pathArray.length === 0) return;
    console.log(`Untracked files:`);
    console.log(
        `  (use \"groot add <file>...\" to include what will be committed or else groot /help`,
    );
    pathArray.forEach((eachPath) => {
        console.log(
            `         \x1b[38;2;255;90;90m${path.basename(eachPath)}\x1b[0m`,
        );
    });
}

function printModifiedFiles(pathArray: string[]) {
    if (pathArray.length === 0) return;
    console.log(`Changes not staged for commit:`);
    console.log(
        `  (use \"groot add <file>...\" to update what will be committed or else groot /help`,
    );
    pathArray.forEach((eachPath) => {
        console.log(
            `         \x1b[38;2;245;200;87mmodified:   ${eachPath}\x1b[0m`,
        );
    });
}
// this is modified

/*

    ScanDirectory():
        first we call scan directory with fetchGrootPath and tell it to scan all this

        when it finds a folder it again recursively calls scanDirectory with this new folder path and then goes on the cycle

        in the end we get three different arrays
        thats it

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
