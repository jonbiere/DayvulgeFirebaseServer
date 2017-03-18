"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var firebase = require("firebase-admin");
var cron = require("cron");
var logger_1 = require("./logger");
var Scheduler = (function () {
    function Scheduler(firebase) {
        this.firebase = firebase;
    }
    Scheduler.prototype.start = function () {
        var _this = this;
        var vulgeWinnerJob = new cron.CronJob({
            cronTime: '0 */5 * * * *',
            onTick: function () { _this.vulgeWinner(); },
            start: false,
            timeZone: 'America/Chicago'
        });
        vulgeWinnerJob.start();
    };
    Scheduler.prototype.vulgeWinner = function () {
        logger_1.logger.info("Job Ticked at " + new Date().toString());
        var firebaseDb = this.firebase.database();
        firebaseDb.ref('/activeCollection').once('value', function (triggeredCollection) {
            var triggeredKey = Object.keys(triggeredCollection.val())[0];
            firebaseDb.ref("/vulgeCollections/" + triggeredKey).update({
                isActive: false
            }).then(function () {
                firebaseDb.ref('/activeCollection').set(null).then(function () {
                    firebaseDb.ref("/vulgeCollections/" + triggeredKey + "/vulges").orderByChild('votes').limitToLast(1).once('value', function (dataSnapshot) {
                        var winnerObj;
                        if (dataSnapshot.exists() && dataSnapshot.hasChildren()) {
                            winnerObj = dataSnapshot.val();
                            var key = Object.keys(winnerObj)[0];
                            logger_1.logger.info("Winner: " + JSON.stringify(winnerObj));
                            firebaseDb.ref("/winners/" + key).set(winnerObj[key]);
                            firebaseDb.ref('/activeWinner').set(winnerObj[key]);
                        }
                        else {
                            winnerObj = {
                                createdDate: firebase.database['ServerValue']['TIMESTAMP'],
                                vulgeText: 'Today will not be remembered....',
                                userName: 'Nobody',
                                userKey: null
                            };
                            firebaseDb.ref("/winners/").push(winnerObj);
                            firebaseDb.ref('/activeWinner').set(winnerObj);
                        }
                        var freshRef = firebaseDb.ref('/activeCollection').push(0);
                        firebaseDb.ref("/vulgeCollections/" + freshRef.key).set({
                            date: firebase.database['ServerValue']['TIMESTAMP'],
                            isActive: true
                        });
                    });
                });
            });
        });
    };
    return Scheduler;
}());
exports.Scheduler = Scheduler;
