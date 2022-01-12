const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "assignment.db");
let database = null;

const initializeDBAndServer = async () => {
    try {
        database = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server running at http://localhost:3000/");
        });
    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

app.get("/", (request, response) => {
    response.sendFile("index.html", { root: __dirname });
});

app.get("/:name/", async (request, response) => {
    var currentdate = new Date();
    const { name } = request.params;
    let randomIdObject;
    let randomId;
    let status = true;
    while (status) {
        let randomNum = Math.floor(Math.random() * 1000 + 1);
        randomId = name + randomNum;
        const sqlQuery = `SELECT * FROM randomID where random_id='${randomId}'`;
        // console.log(sqlQuery);
        randomIdObject = await database.get(sqlQuery);
        // console.log(randomIdObject);
        if (randomIdObject === undefined) {
            status = false;
        }
    }
    if (randomIdObject === undefined) {
        const insertQuery = `INSERT INTO randomID (random_id) values ('${randomId}')`;
        await database.run(insertQuery);
        var datetime =
            currentdate.getDate() +
            "/" +
            (currentdate.getMonth() + 1) +
            "/" +
            currentdate.getFullYear() +
            " @ " +
            currentdate.getHours() +
            ":" +
            currentdate.getMinutes() +
            ":" +
            currentdate.getSeconds();
        response.status(200);
        response.json({
            ID: randomId,
            Name: name,
            DateTime: datetime,
        });
    }
});

module.exports = app;
