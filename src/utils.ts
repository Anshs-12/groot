import path from "path";
import fs from "fs";

export function readGrootIgnore(): string[] {
    let grootIgnoreContent: string[];
    let grootIgnorePath: string = path.join(fetchGrootPath(), ".grootignore");
    grootIgnoreContent = fs
        .readFileSync(grootIgnorePath, "utf-8")
        .split("\n")
        .map((eachWord) => eachWord.trim()) // removes the unwanted spaces characters like \r or \n
        .filter((eachWord) => eachWord !== "");
    return grootIgnoreContent;
}

export function fetchGrootPath(): string {
    let currentPath: string = path.join(process.cwd());
    while (currentPath != path.dirname(currentPath)) {
        if (fs.existsSync(path.join(currentPath, ".groot"))) return currentPath;
        currentPath = path.dirname(currentPath);
    }
    console.log(`groot was never initialized, please run groot init`);
    process.exit(1);
    /*
        In psudeo code, this should work first by scannign
        the current path entirely to find out the groot folder
        if its found then this path is correct

        If its not found then mvoe on to the above path which makes no sense why we are searching only up rather not down along with up

        Now we go up and do the same shit again by sacnning all the path
        checking if its a dir along with name ===".groot", so this becomes the path which was required rather than moving along the way finding out.

        now again this is repeated until we find the path perfectly!
    */
}

export type indexJsonFileStructure = {
    file: string;
    hash: string;
};

export type commitStructure = {
    commitId: string;
    commitMessage: string;
    timeStamp: string;
    snapshot: Record<string, string>;
    parent: string | null;
};
