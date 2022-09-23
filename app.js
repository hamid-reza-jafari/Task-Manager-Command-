console.clear()
// its my app's starter 
import 'dotenv/config';
import chalk from 'chalk';

import Action from "./action.js";
import inquirer from 'inquirer';

const command = process.argv[2]; // after 0 , 1 index - nodejs default

const commands = [
    "list",
    "add",
    "delete",
    "delete-all",
    "edit",
    "export",
    "import",
    "download"
];

const error_msg = chalk.redBright.bold
const warn_msg = chalk.yellowBright.bold

function run_selected(command) {
    command === "list" ? Action.list() :
        command === "add" ? Action.add() :
            command === "delete" ? Action.delete() :
                command === "delete-all" ? Action.deleteAll() :
                    command === "edit" ? Action.edit() :
                        command === "export" ? Action.export() :
                            command === "import" ? Action.import() :
                                command === "download" ? Action.download() :
                                    console.log(error_msg("please select from list..."));
}

if (command) {
    run_selected(command)
} else {
    inquirer.prompt({
        type: "list",
        name: "command",
        message: "Please Select Your Command :",
        choices: commands,
    }).then(answer => {
        let command = answer.command;
        run_selected(command)
    })
}

// ~ Downloaded Link (Test CSV) => https://test.otedia.com/nodejs/backup.csv 