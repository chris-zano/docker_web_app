/**
 * @file index.js
 * @description This module sets up and starts the Express application, connects to MongoDB, and includes middleware and routes configuration.
 */
const path = require("path");
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const cpuCount = os.cpus().length;

if (cluster.isMaster) {
    console.log(`The primary process has a pid of ${process.pid}.`);
    console.log(`The total number of CPUs is ${cpuCount}.`);

    // Fork workers.
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}.`);
        console.log('Starting a new worker...');
        cluster.fork();
    });
} else {
    // Worker processes

    const app = express();
    const server = http.createServer(app);

    const STATIC_FILES_PATH = path.join(__dirname, 'public');
    const VIEW_ENGINE_TEMPLATES_PATH = path.join(__dirname, 'views');

    app.use(bodyParser.json());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/public', express.static(STATIC_FILES_PATH));

    app.set('views', VIEW_ENGINE_TEMPLATES_PATH);
    app.set('view engine', 'ejs');

    const username = encodeURIComponent(process.env.MONGO_DB_USERNAME);
    const password = encodeURIComponent(process.env.MONGO_DB_PASSWORD);
    const clusterName = encodeURIComponent(process.env.CLUSTER_NAME);
    const appName = encodeURIComponent(process.env.APP_NAME);
    const databasename = encodeURIComponent(process.env.DATABASE_NAME);

    const uri = `mongodb+srv://${username}:${password}@${clusterName}.jwscxvu.mongodb.net/${databasename}?retryWrites=true&w=majority&appName=${appName}`;

    //connect to database and start server
    (async () => {
        try {
            await mongoose.connect(uri);
            console.log('Connected to MongoDB Atlas');

            require('./requireStack').callAndExecuteRequireStack(app, server);

            const PORT = process.env.PORT || 8080;
            server.listen(PORT, () => {
                console.log(`App is live at https://at-file-server.onrender.com/`);
                console.log(`A worker has started with a pid of ${process.pid}`);
            });

            //handle graceful shutdowns
            process.on('SIGTERM', () => {
                server.close(() => {
                    console.log('Process terminated');
                    mongoose.connection.close(false, () => {
                        console.log('MongoDb connection closed.');
                        process.exit(0);
                    });
                });
            });
        } catch (error) {
            console.error('Error connecting to MongoDB Atlas:', error);
        }
    })();
}