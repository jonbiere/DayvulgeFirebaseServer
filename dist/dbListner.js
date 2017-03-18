"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var DbListner = (function () {
    function DbListner(firebase) {
        this.firebase = firebase;
    }
    DbListner.prototype.listen = function () {
        var firebaseDb = this.firebase.database();
        var listners = [];
        firebaseDb.ref('/activeCollection').on('value', function (activeCollection) {
            if (activeCollection.exists()) {
                logger_1.logger.info("Turning On DbListners");
                listners = [];
                var collectionKey_1 = Object.keys(activeCollection.val())[0];
                var vulgeCollectionRef = firebaseDb.ref("/vulgeCollections/" + collectionKey_1 + "/vulges");
                listners.push(vulgeCollectionRef);
                vulgeCollectionRef.on('value', function (dataSnapshot) {
                    logger_1.logger.debug("Vulges Changed for collection: " + collectionKey_1);
                });
            }
            else {
                if (listners && listners.length) {
                    logger_1.logger.info("Turning Off DbListners");
                    listners.forEach(function (dbRef) {
                        dbRef.off();
                    });
                }
            }
        });
    };
    return DbListner;
}());
exports.DbListner = DbListner;
