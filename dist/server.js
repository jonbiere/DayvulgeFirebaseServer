"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var path = require("path");
var firebase = require("firebase-admin");
var errorHandler = require("errorhandler");
var methodOverride = require("method-override");
var scheduler_1 = require("./scheduler");
var dbListner_1 = require("./dbListner");
var logger_1 = require("./logger");
var cors = require("cors");
var routes_1 = require("./routes");
var Server = (function () {
    function Server() {
        this.app = express();
        this.config();
        this.api();
    }
    Server.bootstrap = function () {
        return new Server();
    };
    Server.prototype.api = function () {
        var router;
        router = express.Router();
        routes_1.IndexRoute.create(router);
        routes_1.VoteRoute.create(router, this.firebase);
        this.app.use('/api', router);
    };
    Server.prototype.config = function () {
        var originsWhiteList = [
            'http://localhost:3000'
        ];
        var corsOption = {
            origin: function (origin, callback) {
                callback(null, originsWhiteList.indexOf(origin) !== -1);
            },
            credentials: true
        };
        this.app.use(cors(corsOption));
        this.app.use(express.static(path.join(__dirname, "public")));
        this.app.set("views", path.join(__dirname, "views"));
        this.app.set("view engine", "pug");
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use(methodOverride());
        this.app.use(function (err, req, res, next) {
            err.status = 404;
            next(err);
        });
        this.app.use(errorHandler());
        this.firebase = this.initFirebase();
        var firebaseScheduler = new scheduler_1.Scheduler(this.firebase);
        firebaseScheduler.start();
        var dbListner = new dbListner_1.DbListner(this.firebase);
        dbListner.listen();
    };
    Server.prototype.initFirebase = function () {
        logger_1.logger.debug("Initializing firebase...");
        var serviceAccount = require("../dayvulgeAdminKey.json");
        return firebase.initializeApp({
            credential: firebase.credential.cert(serviceAccount),
            databaseURL: 'https://dayvulge-27f09.firebaseio.com'
        });
    };
    Server.prototype.routes = function () {
    };
    return Server;
}());
exports.Server = Server;
