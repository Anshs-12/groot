export function help() {
    const section = `\x1b[38;2;130;150;180m`;
    const command = `\x1b[38;2;140;200;140m`;
    const reset = `\x1b[0m`;

    console.log(`These are the available Groot commands: `);

    console.log(`\n${section}start a working area${reset}`);
    console.log(
        `   ${command}groot init${reset}                     Create an empty Groot repository`,
    );

    console.log(`\n${section}work on the current change${reset}`);
    console.log(
        `   ${command}groot add <file>${reset}               Add file contents to the index`,
    );

    console.log(`\n${section}examine the history and state${reset}`);
    console.log(
        `   ${command}groot log${reset}                      Show complete commit logs`,
    );
    console.log(
        `   ${command}groot log --oneline${reset}            Show condensed one-line commit logs`,
    );
    console.log(
        `   ${command}groot status${reset}                   Show working tree status`,
    );

    console.log(`\n${section}save your work${reset}`);
    console.log(
        `   ${command}groot commit -m "message"${reset}      Record changes to the repository`,
    );

    console.log(`\n${section}other${reset}`);
    console.log(
        `   ${command}groot help${reset}                     Show this help message`,
    );

    console.log();
}
