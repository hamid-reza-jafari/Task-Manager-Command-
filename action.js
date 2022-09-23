// call my jobs after send request from user
console.clear()
import fs from "fs";

import chalk from "chalk";
import inquirer from "inquirer";
import axios from "axios";
import { parse, stringify } from "csv/sync";

import DB from "./db.js";
import Task from "./task.js";

const _warn = chalk.yellowBright.bold;
const _success = chalk.greenBright.bold;
const _error = chalk.redBright.bold

export default class Action {
    // # LIST
    static list() {
        const tasks = Task.getAllTasks(true);
        if (tasks.length) {
            console.table(tasks)
        } else {
            console.log(_warn("There is not any Tasks..."))
        }
    }

    // # ADD
    static async add() {
        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "Enter Task Title: ",
                validate: (value) => {
                    if (value.length < 3) {
                        return "The Title Should 3 Char or More at 3 !"
                    }
                    return true;
                },
            },
            {
                type: "confirm",
                name: "completed",
                message: "Is this task completed ?",
                default: false,
            }
        ])

        try {
            const task = new Task(answers.title, answers.completed);
            task.save();
            console.log(_success("Your Task Saved... Successfully !"))
        } catch (e) {
            console.log(_error(e.message));
        }
    }

    // # DELETE
    static async delete() {
        const tasks = DB.getAllTasks();
        const choices = []

        for (let x of tasks) {
            choices.push(x.title)
        }

        const answer = await inquirer.prompt({
            type: "list",
            name: "title",
            message: "Select Your Task For Delete : ",
            choices,
        })

        const selectedTask = DB.getTaskByTitle(answer.title);

        try {
            DB.deletedTask(selectedTask.id)
            console.log(_success("Your Selected Task Deleted."))
        } catch (e) {
            console.log(_error(e.message));
        }
    }


    // # DELETE ALL
    static async deleteAll() {
        const answer = await inquirer.prompt({
            type: "confirm",
            name: "result",
            message: "Are You Sure ? ( delete all Tasks )",
        })
        if (answer.result) {
            try {
                DB.resetDB();
                console.log(_success("Databiss Reset To Empty..."));
            } catch (e) {
                console.log(e.message)
            }
        }
    }

    // # Edit
    static async edit() {
        const tasks = DB.getAllTasks();
        const choices = []

        for (let x of tasks) {
            choices.push(x.title)
        }

        const answer = await inquirer.prompt({
            type: "list",
            name: "title",
            message: "Select Your Task For Delete : ",
            choices,
        })

        const selectedTask = Task.getTaskByTitle(answer.title);

        const afterEdit = await inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: `Type Title... `,
                validate: (val) => {
                    if (val.length < 3) {
                        return "The Title should more than 3 char";
                    }
                    return true
                },
                default: selectedTask.title,
            },
            {
                type: "confirm",
                name: "completed",
                message: `is this completed ? ( now is ${selectedTask.completed} )`,
                default: selectedTask.completed,
            }
        ])

        try {
            DB.manageTask(afterEdit.title, afterEdit.completed, selectedTask.id)
            console.log(_success("Your Selected Task Edited."))
            return true;
        } catch (e) {
            console.log(_error(e.message));
        }

    }

    // # Export
    static async export() {
        const answerFileName = await inquirer.prompt({
            type: "input",
            name: "filename",
            message: "Enter Your File Name ( By Ext )",
            validate: (value) => {
                if (!/^[\w .-]{1,50}$/.test(value)) {
                    return "Please Enter a csv file name for create or overwrite..."
                }
                return true;
            }
        })

        const allTask = Task.getAllTasks(true)
        const output = stringify(allTask, {
            header: true,
            // در پایین میگیم اگ داده من بولین بود بجای 0 و 1 که پیشفرض ماژول هس - استرینگ ترو فالس نشون بده
            cast: {
                boolean: (val, context) => {
                    return String(val);
                }
            }
        })

        try {
            fs.writeFileSync(answerFileName.filename, output);
            console.log(_success("Your CSV File Saved And Export Was Success !"))
        } catch (e) {
            console.log(_error("Your CSV Dont Saved..."))
        }
    }

    // # Import from csv
    static async import() {
        const answerFileName = await inquirer.prompt({
            type: "input",
            name: "filename",
            message: "Enter Your File Path :",
        })

        if (fs.existsSync(answerFileName.filename)) {
            try {
                const importFile = fs.readFileSync(answerFileName.filename);
                // فایل بالا یک بافر هست اما چون ماژول سی اس وی و متود پارس آن در زیر میتواند با بافر کار کند پس دیگ یو تی اف 8 بهش نمیدیم

                const data = parse(importFile, {
                    columns: true,
                    cast: (value, context) => {
                        if (context.column === "id") {
                            return Number(value)
                        } else if (context.column === "completed") {
                            return value.toLowerCase() === "true" ? true : false;
                        }
                        return value;
                    }
                })
                DB.importTasks(data);
                console.log(_success("Your csv file imported ..."))
            } catch (e) {
                console.log(_error(e.message))
            }
        } else {
            console.log(_error("your impored file not exists !"))
        }
    }

    // # Download (Import From URL)
    static async download() {
        const answer = await inquirer.prompt({
            type: "input",
            name: "fileUrl",
            message: "Enter Url For Import"
        })

        const config = {
            url: answer.fileUrl,
            method: "get"
        }
        
        try {
            const response = await axios(config)
            const data = parse(response.data, {
                columns: true,
                cast: (value, context) => {
                    if (context.column === "id") {
                        return Number(value)
                    } else if (context.column === "completed") {
                        return value.toLowerCase() === "true" ? true : false;
                    }
                    return value;
                }
            })
            DB.importTasks(data);
            console.log(_success("Your csv file imported ..."))
            console.table(data)
        } catch (e) {
            console.log(e.message)
        }
    }
    //
}