import 'dotenv/config';
import fs from 'fs';
import chalk from 'chalk';

const db_file = process.env.DB_FILE;
const warn = chalk.yellowBright.bold;
const success = chalk.greenBright.bold;


export default class DB {
    // ~ Create Databiss If Not Exists.
    static createDB() {
        // # اگر فایل وجود داشت ، دیگ نمیخوایم دیتابیس رو بسازه تا اطلاعات قبلی پاک بشه
        if (fs.existsSync(db_file)) {
            return false;
        }
        try {
            fs.writeFileSync(db_file, '[]', 'utf8')
            return true;
        } catch (e) {
            throw new Error("Can Not Write in " + db_file)
        }
    }

    // ~ Reset Databiss To Default
    static resetDB() {
        try {
            fs.writeFileSync(db_file, "[]", "utf-8");
            return true;
        } catch (e) {
            throw new Error("Reset DBFile Not Successfully !")
        }
    }

    // ~ Db Exits Or No !? 
    static DbExists() {
        if (fs.existsSync(db_file)) {
            return true;
        } else {
            return false;
        }
    }

    // # Get Task By Id
    static getTaskById(id) {
        let data;
        if (DB.DbExists()) {
            data = fs.readFileSync(db_file, "utf-8")
        } else {
            try {
                DB.createDB();
                return false;
            } catch (e) {
                throw new Error(e.message);
            }
        }

        try {
            data = JSON.parse(data);
            const itsTask = data.find(x => x.id === Number(id));
            return itsTask ? itsTask : false;
        } catch (e) {
            throw new Error("Syntax Error. \nPlease Check DB File");
        }
    }

    // # Get Task By Title
    static getTaskByTitle(title) {
        let data;
        if (DB.DbExists()) {
            data = fs.readFileSync(db_file, "utf-8")
        } else {
            try {
                DB.createDB();
                return false;
            } catch (e) {
                throw new Error(e.message);
            }
        }

        try {
            data = JSON.parse(data);
            const itsTask = data.find(x => x.title.toUpperCase() === title.toUpperCase());
            return itsTask ? itsTask : false;
        } catch (e) {
            throw new Error("Syntax Error. \nPlease Check DB File");
        }
    }

    // # Get All Tasks
    static getAllTasks() {
        let data;
        if (DB.DbExists()) {
            data = fs.readFileSync(db_file, "utf-8")
        } else {
            try {
                DB.createDB();
                return false;
            } catch (e) {
                throw new Error(e.message);
            }
        }

        try {
            data = JSON.parse(data);
            return data ? data : false;
        } catch (e) {
            throw new Error("Syntax Error. \nPlease Check DB File");
        }
    }

    // # Add Or Edit Tasks...
    static manageTask(title, completed = false, id = 0) {
        id = Number(id)

        if (id < 0 || id !== parseInt(id)) {
            throw new Error("Your Id is Not ok.")
        } else if (typeof title !== "string" || title.length < 3) {
            throw new Error("Your Title Is Not OK.")
        }

        const task = this.getTaskByTitle(title);
        if (task && task.id !== id) {
            throw new Error("Duplicate Task Title !")
        }

        let data;
        if (DB.DbExists()) {
            data = fs.readFileSync(db_file, "utf-8")
        } else {
            try {
                DB.createDB();
                return false;
            } catch (e) {
                throw new Error(e.message);
            }
        }

        try {
            data = JSON.parse(data)
        } catch (e) {
            throw new Error("DB dont parsed !")
        }

        // ~ if id == 0 -> new task
        if (id === 0) {
            if (data.length === 0) {
                id = 1;
            } else {
                id = data[data.length - 1].id + 1;
            }
            data.push({
                id,
                title,
                completed
            });

            const toJson = JSON.stringify(data);
            try {
                fs.writeFileSync(db_file, toJson, "utf-8")
                return Number(id);
            } catch (e) {
                throw new Error("Can't Add New Task.")
            }
        } else {
            let helper = false;
            data.forEach(x => {
                if (x.id === id) {
                    x.title = title;
                    x.completed = completed;

                    const dataToJson = JSON.stringify(data);
                    try {
                        fs.writeFileSync(db_file, dataToJson, "utf-8")
                        helper = true;
                        return true;
                    } catch (e) {
                        throw new Error("Can't Add New Task.")
                    }
                }
            });
            if (!helper) {
                throw new Error("Task Not Found For Change...")
            } else {
                return true;
            }
        }
    }

    static importTasks(data) {
        if (typeof data === "string") {
            try {
                data = JSON.parse(data)
            } catch (e) {
                throw new Error("Your File Not OK For Import !")
            }
        }

        if (data instanceof Array) {
            data = JSON.stringify(data)
        } else {
            throw new Error("Invalid Your Imported File")
        }

        try {
            fs.writeFileSync(db_file, data);
        } catch (e) {
            throw new Error("Can Not Write To DB")
        }
    }

    static deletedTask(id) {
        id = Number(id)

        if (id > 0 && id === parseInt(id)) {
            let data;
            try {
                data = fs.readFileSync(db_file, "utf-8")
                data = JSON.parse(data)
            } catch (e) {
                throw new Error("Cant Read DB !")
            }

            data.forEach(x => {
                if (x.id === id) {
                    let index = data.indexOf(x);
                    data.splice(index, 1);
                }
            })

            data = JSON.stringify(data);

            try {
                fs.writeFileSync(db_file, data, "utf-8")
                return true;
            } catch (e) {
                throw new Error("cant write in db")
            }
        }
    }
    // end class bracket
}