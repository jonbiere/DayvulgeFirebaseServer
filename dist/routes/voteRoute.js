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
var firebase = require("firebase-admin");
var statusCodes_1 = require("./statusCodes");
var models_1 = require("../models");
var VoteRoute = (function (_super) {
    __extends(VoteRoute, _super);
    function VoteRoute(req, res, next) {
        return _super.call(this, req, res, next) || this;
    }
    VoteRoute.create = function (router, firebase) {
        logger_1.logger.debug("[VoteRoute::create] Creating index route.");
        this.firebase = firebase;
        router.post("/vote", function (req, res, next) {
            new VoteRoute(req, res, next).post();
        });
    };
    VoteRoute.prototype.post = function () {
        var _this = this;
        var token = this.req.body.userToken;
        var vulgeKey = this.req.body.vulgeKey;
        if (token && vulgeKey) {
            VoteRoute.firebase.auth().verifyIdToken(token).then(function (decodedToken) {
                var userKey = decodedToken.uid;
                var firebaseDb = VoteRoute.firebase.database();
                try {
                    firebaseDb.ref('/activeCollection').once('value', function (activeCollection) {
                        if (activeCollection.exists()) {
                            var collectionKey = Object.keys(activeCollection.val())[0];
                            var vulgeRef_1 = firebaseDb.ref("/vulgeCollections/" + collectionKey + "/vulges/" + vulgeKey);
                            vulgeRef_1.once('value', function (vulge) {
                                if (vulge.exists()) {
                                    var userProfileRef_1 = firebaseDb.ref("/userObjs/userProfiles/" + userKey + "/");
                                    userProfileRef_1.once('value', function (userProfile) {
                                        var profile = userProfile.val();
                                        if (userProfile.exists() && profile.votes > 0) {
                                            VoteRoute.firebase.auth().getUser(userKey).then(function (currentUserObj) {
                                                userProfileRef_1.update({
                                                    votes: --profile.votes
                                                });
                                                var up = _this.req.body.up;
                                                vulgeRef_1.update({
                                                    votes: up ? ++vulge.val().votes : --vulge.val().votes
                                                });
                                                _this.registerVulgeVote(firebaseDb, vulge, currentUserObj, up);
                                                _this.registerUserVote(firebaseDb, vulge, currentUserObj, up);
                                                _this.registerVoteNotification(firebaseDb, vulge, currentUserObj, up);
                                                _this.sendJson({ success: true });
                                            });
                                        }
                                        else {
                                            throw new Error("User not found");
                                        }
                                    });
                                }
                                else {
                                    _this.sendJson({ success: false, message: "Voting period ended." });
                                }
                            });
                        }
                        else {
                            _this.sendJson({ success: false, message: "Voting period ended." });
                        }
                    });
                }
                catch (e) {
                    _this.sendError(statusCodes_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
                }
            }, function (error) { _this.sendError(statusCodes_1.HTTP_STATUS_CODES.UNAUTHORIZED); });
        }
        else {
            this.sendError(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST);
        }
    };
    VoteRoute.prototype.registerVulgeVote = function (firebaseDb, vulge, currentUserObj, up) {
        firebaseDb.ref("/userObjs/userVulgesVotes/" + vulge.val().userKey + "/" + vulge.key).push({
            userKey: currentUserObj.uid,
            voteUp: up,
            profilePic: currentUserObj.photoURL
        });
    };
    VoteRoute.prototype.registerUserVote = function (firebaseDb, vulge, currentUserObj, up) {
        firebaseDb.ref("/userObjs/userVotes/" + currentUserObj.uid + "/" + vulge.key).once('value', function (userVote) {
            if (userVote.exists()) {
                var userVoteObj = userVote.val();
                if (up) {
                    userVoteObj.numUpVotes = userVoteObj.numUpVotes ? ++userVoteObj.numUpVotes : 1;
                }
                else {
                    userVoteObj.numDownVotes = userVoteObj.numDownVotes ? ++userVoteObj.numDownVotes : 1;
                }
                userVoteObj.voteDate = firebase.database.ServerValue.TIMESTAMP;
                firebaseDb.ref("/userObjs/userVotes/" + currentUserObj.uid + "/" + vulge.key).update(userVoteObj);
            }
            else {
                var vulgeData = vulge.val();
                firebaseDb.ref("/userObjs/userVotes/" + currentUserObj.uid + "/" + vulge.key).set({
                    vulgeUserName: vulgeData.userName,
                    profilePic: "",
                    vulgeText: vulgeData.vulgeText,
                    voteDate: firebase.database.ServerValue.TIMESTAMP,
                    numUpVotes: up ? 1 : 0,
                    numDownVotes: up ? 0 : 1
                });
            }
        });
    };
    VoteRoute.prototype.registerVoteNotification = function (firebaseDb, vulge, currentUserObj, up) {
        firebaseDb.ref("/userObjs/userNotifications/" + vulge.val().userKey).push(new models_1.NotificationModel(vulge.val().userKey, currentUserObj.email, firebase.database.ServerValue.TIMESTAMP, up ? 0 : 1));
    };
    return VoteRoute;
}(baseRoute_1.BaseRoute));
exports.VoteRoute = VoteRoute;
