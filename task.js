// ~ هدف از ایجاد این کلاس
// کلاسی برای تغیر در فرم و ویرایش در داده ها
// کلاسی برای ساده کردن عملیات ویرایش - اد یا ... در دیتابیس

// # معمولا تو برنامه های واقعی برای هرنوع داده مث تسک ها یک کلاس مینویسیم که ساختار و دستورات را ساده و راحت کنیم و بعد در برنامه با همون کلاسی که برای هر داده ساختیم کار میکنیم

import util from "util"; // nodejs module /+/ کنترل نحوه نمایش آبجکت در کنسول

import chalk from "chalk"; // out moduls

import DB from "./db.js"; // my module

export default class Task {
    // پراپرتی های زیر بصورت شخصی برای این کلاس فقط هستن و با گتر یا ستر کنترل باید بشن
    #id = 0;
    #title;
    #completed;

    constructor(title, completed) {
        // this.title & this.completed = اینها پراپرتی نیستند و گتر و ستر ما هستن
        this.title = title;
        this.completed = completed;
    }

    get id() {
        return this.#id
    }

    get title() {
        return this.#title
    }

    get completed() {
        return this.#completed
    }

    set title(value) {
        if (typeof value !== "string" || value.length < 3) {
            throw new Error("Your title value invalid !")
        }
        this.#title = value;
    }

    set completed(value) {
        value = Boolean(value);
        if (typeof value !== "boolean") {
            throw new Error("Your Completed Data isnt Boolean !")
        }
        this.#completed = value;
    }

    [util.inspect.custom]() {
        return `Task =>
            Id: ${chalk.yellowBright(this.id)}
            Title: ${chalk.greenBright.bold("'" + this.title + "'")}
            Completed: ${chalk.blueBright(this.completed)}
        `;
    }

    save() {
        try {
            const returned_id = DB.manageTask(this.#title, this.#completed, this.#id)
            this.#id = returned_id;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    static getTaskById(id) {
        const task = DB.getTaskById(id)
        if (task) {
            let item = new Task(task.title, task.completed)
            item.#id = task.id;
            return item
        } else {
            return false;
        }
    }

    static getTaskByTitle(title) {
        const task = DB.getTaskByTitle(title)
        if (task) {
            let item = new Task(task.title, task.completed)
            item.#id = task.id;
            return item
        } else {
            return false;
        }
    }

    static getAllTasks(rawObj = false) {
        const allTasks = DB.getAllTasks();

        if (rawObj) {
            return allTasks;
        }

        let itemsArr = [];

        for (let task of allTasks) {
            const item = new Task(task.title, task.completed);
            item.#id = task.id;
            itemsArr.push(item)
        }
        return itemsArr;
    }
}