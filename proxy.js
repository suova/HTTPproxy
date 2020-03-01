'use strict';
const http = require('http');
const net = require('net');
const server = net.createServer();
const parser = require('http-string-parser');
const DB = require('./bd')();
server.on('connection', (clientToProxySocket) => {
    clientToProxySocket.once('data', (data) => {
        //console.log("data", data.toString());

        let isTLSConnection = data.toString().indexOf('CONNECT') !== -1;
        let serverPort = 80;
        let serverAddress;
        if (isTLSConnection) {
            serverPort = data.toString()
                .split('CONNECT ')[1].split(' ')[0].split(':')[1];
            serverAddress = data.toString()
                .split('CONNECT ')[1].split(' ')[0].split(':')[0];
        } else {
            serverAddress = data.toString().split('Host: ')[1].split('\r\n')[0];
        }
        let request = parser.parseRequest(data.toString());
        const options = {
            method: request.method,
            path: request.uri,
            port: 80,
            headers: request.headers,
            agent: new http.Agent({ keepAlive: this.keepAlive }),
            body: request.body
        };
        if(options.method === 'GET' && options.path.split('/').length=== 4 ){
            DB.add(options.method, options.path, options.headers, options.body);
            console.log("options", options);
        }


        let proxyToServerSocket = net.createConnection({
            host: serverAddress,
            port: serverPort
        }, () => {
            if (isTLSConnection) {
                clientToProxySocket.write('HTTP/1.1 200 OK\r\n\n');
            } else {
                proxyToServerSocket.write(data);
            }

            clientToProxySocket.pipe(proxyToServerSocket);
            proxyToServerSocket.pipe(clientToProxySocket);

            proxyToServerSocket.on('error', (err) => {
                console.log('PROXY TO SERVER ERROR');
                console.log(err);
            });

        });
        clientToProxySocket.on('error', err => {
            console.log('CLIENT TO PROXY ERROR');
            console.log(err);
        });
    });
});

server.on('error', (err) => {
    console.log('SERVER ERROR');
    console.log(err);
    throw err;
});

server.on('close', () => {
    console.log('Client Disconnected');
});

server.listen(8124, () => {
    console.log('Server runnig at http://localhost:' + 8124);
});