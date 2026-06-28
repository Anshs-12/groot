# Groot — A Git-Inspired Version Control System

A lightweight, Git-inspired version control system CLI built with TypeScript and Bun. Groot implements core version control mechanics from first principles: content-addressable storage, staging indices, commit graphs, and history traversal.

## Overview

Groot is a proof-of-concept VCS that demonstrates how distributed version control systems work under the hood. It provides essential Git-like commands while maintaining a minimal, readable codebase suitable for learning or extending.

**Key Design Principles:**

- **Content-Addressable Storage**: Files are stored by SHA-256 hash of their content, ensuring deduplication and integrity
- **Staging Workflow**: Changes are staged before commit, allowing selective snapshots
- **Immutable History**: Commit objects are immutable; history is a directed acyclic graph traversable via linked lists
- **Efficient Diff Detection**: Myers diff algorithm for identifying line-level changes between commits

## Installation

```bash
npm install -g grootx-vcs
```

That's it. The `groot` command is now available globally.

### Local Development Setup

If you want to contribute or run from source:

1. **Clone the repository**
```bash
    git clone https://github.com/Anshs-12/groot.git
    cd groot
```

2. **Install dependencies**
```bash
    bun install
```

3. **Link as global command**
```bash
    bun link --global
    groot init
```

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                     CLI Layer                       │
│              (init, add, commit, log, etc.)         │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│       Core Version Control System Engine            │
│  ┌────────────────────────────────────────────────┐ │
│  │        • Staging Index (JSON-backed)           │ │
│  │        • HEAD pointer management               │ │
│  │        • Commit graph construction             │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           Object Store (`.groot/`)                  │
│  ┌────────────────────────────────────────────────┐ │
│  │ objects/       (SHA-256 hashed file blobs)     │ │
│  │ commits/       (Commit metadata JSON)          │ │
│  │ HEAD.json      (Current commit pointer)        │ │
│  │ index.json     (Staging area state)            │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Data Model

**Commit Object** (`commits/{id}.json`)

```json
{
    "commitId": "40ef1b3d...",
    "commitMessage": "Initial commit",
    "timeStamp": "2026-06-13T14:32:57.815Z",
    "snapshot": {
        "/path/to/file.ts": "sha256_hash_of_content"
    },
    "parent": "previous_commit_id or null"
}
```

**Staging Index** (`.groot/index.json`)

```json
{
    "/path/to/file.ts": "sha256_hash_of_staged_content"
}
```

**File Storage** (`objects/{sha256_hash}`)

- Raw file content stored by SHA-256 hash
- Deduplication: identical files share one object
- No metadata overhead; hash serves as integrity check

### Algorithm Highlights

**Myers Diff Algorithm**

- Implemented for efficient line-level diff detection
- Tracks edit distance and generates minimal edit scripts
- Used in `diff` command to show changes between working directory and HEAD

**File System Traversal**

- Recursive directory traversal with `.grootignore` support
- Pattern-based file exclusion (similar to `.gitignore`)
- Efficient staging of large file trees

**Commit Graph Traversal**

- Linked-list graph structure via parent pointers
- Linear history traversal for `log` command
- O(n) complexity for history retrieval

## Commands

### `groot init`

Initialize a new Groot repository in the current directory.

```bash
$ groot init
# Displays ASCII art banner and initializes .groot/ directory
# Repo: /path/to/your/project
# Repo initialized successfully
```

Creates `.groot/` with the object store, commit history, and index structure.

---

### `groot add <file>`

Stage a file for commit. The file is hashed via SHA-256 and stored in the object store.

```bash
$ groot add src/utils.ts
Staging area updated successfully.
```

Updates `.groot/index.json` with the file's SHA-256 hash.

---

### `groot commit -m "<message>"`

Create a commit from staged files. Records a snapshot of the staging index and links to the parent commit.

```bash
$ groot commit -m "Add user authentication module"
```

Creates a new commit object in `.groot/commits/` with:

- Unique commit ID (SHA-256 of metadata)
- Message and timestamp
- Snapshot of staged files
- Parent commit reference

---

### `groot log [--oneline]`

Display commit history in chronological order.

```bash
$ groot log
commit 40ef1b3d9d9842694e8e78174b94a50e2261a03e76af36dd5cf987cd43cc33a
Author: groot
Date: 2026-06-13T14:32:57.815Z
    Initial commit

$ groot log --oneline
40ef1b3d(Head->) Initial commit
```

Traverses the commit graph via parent pointers from HEAD.

---

### `groot status`

Show the working tree status: staged changes and untracked files.

```bash
$ groot status
Changes waiting to be committed:
  new file: src/auth.ts
  modified: src/utils.ts

Untracked files:
  src/test.ts
```

Compares the working directory against the staging index and HEAD commit.

---

### `groot diff <file>`

Show differences between the working file and the HEAD commit.

```bash
$ groot diff src/utils.ts

- const x = 1;
+ const y = 2;
  const z = 3;
```

Lines prefixed with `-` are deleted (red), `+` are added (green), and space prefix is unchanged.

Uses Myers diff algorithm to generate a minimal edit script. Output shows:

- `unchanged`: Lines present in both versions
- `add`: New lines in working directory
- `delete`: Lines removed from working directory

---

### `groot restore --staged <file>`

Unstage a file, removing it from the staging index.

```bash
$ groot restore --staged src/auth.ts
```

---

### `groot help`

Display all available commands and usage.

```bash
$ groot help
```

## Project Structure

```
groot/
├── src/
│   ├── cli.ts                    # Entry point, command routing
│   ├── utils.ts                  # Core VCS logic, storage APIs
│   └── commands/
│       ├── init.ts               # Repository initialization
│       ├── add.ts                # Stage files
│       ├── commit.ts             # Create commits
│       ├── log.ts                # Display commit history
│       ├── status.ts             # Show working tree status
│       ├── restore.ts            # Unstage files
│       ├── diff.ts               # Myers diff algorithm + output
│       └── help.ts               # Help message
├── .groot/                       # Repository storage (created at init)
│   ├── objects/                  # SHA-256 hashed file blobs
│   ├── commits/                  # Commit metadata (JSON)
│   ├── HEAD.json                 # Current commit pointer
│   └── index.json                # Staging area snapshot
├── .grootignore                  # File exclusion patterns
├── package.json                  # Dependencies (Bun, TypeScript)
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Development

### Running in Watch Mode

```bash
bun run --watch src/cli.ts <command>
```

### Type Checking

```bash
npx tsc --noEmit
```

### Key Files

| File                   | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `src/utils.ts`         | Core VCS engine: hashing, object store, commit graph |
| `src/commands/diff.ts` | Myers diff algorithm implementation                  |
| `src/cli.ts`           | Command-line interface and routing                   |

### Extending Groot

**Add a new command:**

1. Create `src/commands/newcommand.ts`
2. Export a function matching the command name
3. Import and route in `src/cli.ts`

**Example:**

```typescript
// src/commands/branch.ts
export function branch(branchName: string) {
    // Your implementation
}

// src/cli.ts
import { branch } from "./commands/branch.ts";

case "branch":
    branch(args[1]);
    break;
```

## Technical Notes

- **Hashing**: SHA-256 via Node.js `crypto` module ensures content integrity
- **Storage**: All metadata stored as JSON for simplicity; production systems would use binary formats
- **Performance**: Object store uses direct file I/O; large repositories may need indexing
- **Concurrency**: No locking mechanism; assumes single-user access

## Limitations

- Single-branch workflow (no branch support yet)
- Linear history only (no merge/rebase)
- No remote operations
- File permissions not tracked
- Binary files not optimized

## Future Enhancements

- [ ] Branching and merging
- [ ] Rebase operations
- [ ] Remote repository support (push/pull)
- [ ] Garbage collection for unused objects
- [ ] Tag support
- [ ] Stash functionality
- [ ] Interactive rebase

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
