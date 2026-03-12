import path from "path";
import fs from "fs";

type commitStructure = {
    commitId: string;
    commitMessage: string;
    timeStamp: string;
    files: { file: string; hash: string }[];
    parent: string;
};

export function log() {
    iterateCommits(false);
}

export function logOneline() {
    iterateCommits(true);
}

function iterateCommits(oneline: boolean) {
    let commitPointer: string = getHeadPointer();
    let headPointer: boolean = true;
    while (commitPointer != null) {
        let commitPath: string = path.join(
            process.cwd(),
            ".groot",
            "commits",
            `${commitPointer}` + ".json",
        );
        let commitContent: commitStructure = JSON.parse(
            fs.readFileSync(commitPath, "utf-8"),
        );
        // structure of the output
        // commit Hash
        // timeStamp
        if (oneline) {
            printLogOnelineDetails(commitContent, headPointer);
        } else {
            printLogDetails(commitContent, headPointer);
        }
        headPointer = false;
        commitPointer = commitContent.parent;
    }
}

function getHeadPointer(): string {
    let headJSONPath: string = path.join(process.cwd(), ".groot", "HEAD.json");
    let headContent: string = JSON.parse(
        fs.readFileSync(headJSONPath, "utf-8"),
    );
    return headContent;
}

function printLogDetails(commitContent: commitStructure, headPointer: boolean) {
    if (headPointer) {
        console.log(
            `\x1b[38;2;255;247;205mcommit ${commitContent.commitId}\x1b[0m` +
                `\x1b[38;2;147;233;204m(Head->)\x1b[0m`,
        );
    } else {
        console.log(
            `\x1b[38;2;255;247;205mcommit ${commitContent.commitId}\x1b[0m`,
        );
    }
    // creating dateFormat as: Day, Month, Date
    const date = new Date(commitContent.timeStamp);
    let formattedDate: string = date.toLocaleDateString(`en-US`, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    // creating timeFormat as: Hour, minutes, seconds
    let formattedTime: string = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "2-digit",
        hour12: false,
    });

    // getting current year
    let fullYear: string = date.getFullYear().toString();

    // getting offset timeZone
    let timeZone: number = date.getTimezoneOffset();
    // rgb(211, 224, 234) date color

    let offSetSign: string = timeZone < 0 ? "+" : "-";
    let absTimeZone: number = Math.abs(timeZone);
    let actualTimeZone: string = `${offSetSign}${Math.floor(absTimeZone / 60)
        .toString()
        .padStart(2, "0")}:${(absTimeZone % 60).toString().padStart(2, "0")}`;

    console.log(
        `\x1b[38;2;211;224;234mDate:   ${formattedDate} ${formattedTime} ${fullYear} ${actualTimeZone}\x1b[0m`,
    );
    console.log(
        `\n    \x1b[38;2;152;222;217m${commitContent.commitMessage}\x1b[0m\n`,
    );
}

function printLogOnelineDetails(
    commitContent: commitStructure,
    headPointer: boolean,
) {
    let commitId: string = commitContent.commitId.substring(0, 8);
    if (headPointer) {
        console.log(
            `\x1b[38;2;255;247;205m${commitId}\x1b[0m` +
                `\x1b[38;2;147;233;204m(Head->)\x1b[0m` +
                ` ${commitContent.commitMessage}`,
        );
    } else {
        console.log(
            `\x1b[38;2;255;247;205m${commitId}\x1b[0m` +
                ` ${commitContent.commitMessage}`,
        );
    }
}
// rgb(255, 247, 205) - bright yellow for commit
// rgb(147,233,204) - bright yellow for commit
/*
    The entire flow works this way, such that we head the head and thne iterate
    over the parentId while dynamically creating the path of the parent commit,
    so this way we keep moving behind like in a linkedList printing the commits in
    the desired format!
*/
