import path from "path";
import {
    fetchGrootPath,
    getHeadCommit,
    readFileTryCatch,
    type commitStructure,
    type pathNode,
    type moveType,
    type move,
} from "../utils";

export function diff(filePath: string) {
    let completeFilePath: string = path.resolve(filePath);
    console.log(`completeFilePath : ${completeFilePath}`);

    let oldFileContent: string[] = getOldFileContent(completeFilePath);
    let newFileContent: string[] = getNewFileContent(completeFilePath);

    // Implementing Myer's Diff Algorithm
    let resultNode: pathNode = myersDiffAlgorithm(
        oldFileContent,
        newFileContent,
    );
    let constructionResult: move[] = construction(
        resultNode,
        oldFileContent,
        newFileContent,
    );
    // console.log(`row: ${resultNode.row},col: ${resultNode.col}`);
    // console.log(`resultArray: ${JSON.stringify(constructionResult, null, 2)}`);
    // printResult(constructionResult);
}

function myersDiffAlgorithm(
    oldFileContent: string[],
    newFileContent: string[],
): pathNode {
    let m: number = oldFileContent.length + 1; // length of oldFileContent
    let n: number = newFileContent.length + 1; // length of newFileContent
    // console.log(`m value: ${m}`);
    // console.log(`n value: ${n}`);
    // console.log(`oldFileContent: ${oldFileContent}`);
    // console.log(`newFileContent: ${newFileContent}`);

    let qu: pathNode[] = [];
    let front: number = 0;
    qu.push({ row: 0, col: 0, parent: null });
    for (let d: number = 0; d <= m + n; d++) {
        let qSize: number = qu.length - front;
        for (let i = 0; i < qSize; i++) {
            // BFS works here
            let pop: pathNode = qu[front++]!;
            let newNode: pathNode = greedyConsumeDiagonals(
                pop,
                oldFileContent,
                newFileContent,
            );
            if (newNode.row === m - 1 && newNode.col === n - 1) {
                return newNode;
            }
            // moving right -> add the new line
            if (newNode.col < n) {
                qu.push({
                    row: newNode.row,
                    col: newNode.col + 1,
                    parent: newNode,
                });
            }
            // moving down -> add the new line
            if (newNode.row < m) {
                qu.push({
                    row: newNode.row + 1,
                    col: newNode.col,
                    parent: newNode,
                });
            }
        }
    }
    throw new Error("Myers diff failed — no path found");
}

function construction(
    node: pathNode,
    oldFileContent: string[],
    newFileContent: string[],
): move[] {
    let moves: move[] = [];
    while (node.parent !== null) {
        let parent: pathNode = node.parent!;
        let nodeRow: number = node.row;
        let nodeCol: number = node.col;

        if (parent.row + 1 === nodeRow && parent.col + 1 === nodeCol) {
            moves.push({
                line: newFileContent[parent.col]!,
                moveType: "unchanged",
            });
        } else if (parent.row + 1 === nodeRow) {
            moves.push({
                line: oldFileContent[parent.row]!,
                moveType: "delete",
            });
        } else if (parent.col + 1 === nodeCol) {
            moves.push({
                line: newFileContent[parent.col]!,
                moveType: "add",
            });
        }
        console.log(`nodeRow: ${nodeRow}, nodeCol: ${nodeCol}`);
        console.log(`parentRow: ${parent.row}, parentCol: ${parent.col}`);

        node = node.parent;
    }
    return moves.reverse();
}

function greedyConsumeDiagonals(
    position: pathNode,
    oldFiles: string[],
    newFiles: string[],
): pathNode {
    let row: number = position.row;
    let col: number = position.col;
    let currentNode: pathNode = position;
    while (
        row < oldFiles.length &&
        col < newFiles.length &&
        oldFiles[row] === newFiles[col]
    ) {
        row += 1;
        col += 1;
        let newParent: pathNode = { row: row, col: col, parent: currentNode };
        currentNode = newParent;
    }
    return currentNode;
}

function getOldFileContent(completeFilePath: string): string[] {
    let grootDirPath: string = path.join(fetchGrootPath(), ".groot");
    let headCommit: commitStructure = getHeadCommit();
    let oldFileHash: string | undefined = headCommit.snapshot[completeFilePath];
    if (!oldFileHash) {
        console.log(`file was never committed before: ${completeFilePath}`);
        process.exit(0);
    }
    let fileContent: string[] = readFileTryCatch(
        path.join(grootDirPath, "objects", `${oldFileHash}`),
    ).split("\n");

    if (fileContent[fileContent.length - 1] === "")
        fileContent = fileContent.slice(0, -1);

    return fileContent;
}

function getNewFileContent(completeFilePath: string): string[] {
    let fileContent: string[] = readFileTryCatch(completeFilePath).split("\n");
    if (fileContent[fileContent.length - 1] === "")
        fileContent = fileContent.slice(0, -1);
    return fileContent;
}

function printResult(result: move[]) {
    for (let value of result) {
        console.log(value);
    }
}
diff("index.ts");
