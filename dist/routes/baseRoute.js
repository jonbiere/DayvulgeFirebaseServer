"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var statusCodes_1 = require("./statusCodes");
var BaseRoute = (function () {
    function BaseRoute(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }
    BaseRoute.prototype.sendView = function (view, options) {
        this.res.render(view, options);
    };
    BaseRoute.prototype.sendError = function (statusCode, message) {
        this.res.json(statusCode, { error: message || statusCodes_1.HTTP_STATUS_CODES[statusCode] });
    };
    BaseRoute.prototype.sendJson = function (jsonObj) {
        this.res.json(statusCodes_1.HTTP_STATUS_CODES.OK, jsonObj);
    };
    return BaseRoute;
}());
exports.BaseRoute = BaseRoute;
