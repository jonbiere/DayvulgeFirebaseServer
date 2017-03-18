"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var baseRoute_1 = require("./baseRoute");
var logger_1 = require("../logger");
var IndexRoute = (function (_super) {
    __extends(IndexRoute, _super);
    function IndexRoute(req, res, next) {
        return _super.call(this, req, res, next) || this;
    }
    IndexRoute.create = function (router) {
        logger_1.logger.debug("[IndexRoute::create] Creating index route.");
        router.get("/", function (req, res, next) {
            new IndexRoute(req, res, next).get();
        });
    };
    IndexRoute.prototype.get = function () {
        var options = {
            "message": "Online",
            "title": "Api Status"
        };
        this.sendView("index", options);
    };
    return IndexRoute;
}(baseRoute_1.BaseRoute));
exports.IndexRoute = IndexRoute;
