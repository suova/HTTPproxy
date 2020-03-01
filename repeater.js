'use strict';
const express = require('express');
const http = require('http');
const DB = require('./bd')();
const app = express();

app.get('/', function (req, res) {
    const id = req.query.id;
    DB.find(id).then(rows => {
        if (rows.length === 0) {
            res.end('id is not in db');
            return;
        }
        console.log(rows);
        const row = rows[0];
        const options = {
            method: row.method,
            path: row.url,
            host:  row.url.split('/')[2],
            port: 80,
            headers: row.headers,
            agent: new http.Agent({ keepAlive: true })
        };

        console.log("options", options);
        const request = http.request(options);
        request.end(row.body);

        request.on('response', (ServerResponse) => {
            res.writeHead(ServerResponse.statusCode, ServerResponse.statusMessage, ServerResponse.headers);
            ServerResponse.on('data', (chunk) => {
                res.end(chunk);
            });
            ServerResponse.on('close', () => {
                console.log('close');
            });
        });

        request.on('error', (error) => {
            console.log(error);
        });
    }).catch(err => console.error(err));
}).listen(3000);
