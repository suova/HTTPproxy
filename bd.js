'use strict';
const { Client } = require('pg');
const fs = require('fs');
const OPTIONS = {
    user     : "postgres",
    host     : "localhost",
    database : "postgres",
    password : "postgres",
    port     : 5432

};
const DB_FILE = "schema.sql";
class DB {
    constructor() {
        const sqlScript = fs.readFileSync(DB_FILE).toString();

        this.connection = new Client(OPTIONS);
        this.connection.connect();

        this.connection.query(sqlScript, (err, res) => {
            if (err) {
                console.error(err);
            }
        });
    }

    add(method, url, headers, body) {
        const insertQuery = `INSERT INTO requests (method, url, headers, body) VALUES ($1, $2, $3, $4)`;
        this.connection.query(insertQuery,[
            method,
            url,
            headers,
            body
        ], (err, res) => {
            if (err) {
                console.error(err);
            }
        });
    }

    find(id) {
        return new Promise((resolve, reject) => {
            const selectQuery = 'SELECT * FROM requests WHERE id = $1';
            this.connection.query(selectQuery,[id], (err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve(res.rows);
            });
        });
    }

    destroy() {
        this.connection.end();
    }
}

module.exports = () => new DB();