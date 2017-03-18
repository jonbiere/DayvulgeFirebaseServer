"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NotificationModel = (function () {
    function NotificationModel(notifyUser, createdBy, notifyDate, type) {
        this.notifyUser = notifyUser;
        this.createdBy = createdBy;
        this.notifyDate = notifyDate;
        this.type = type;
        this.hasSeen = false;
    }
    return NotificationModel;
}());
exports.NotificationModel = NotificationModel;
