import { logger } from './logger';
import * as firebase from "firebase-admin";

//TODO: Do i want this?
export class FirebaseRefService {
    
    // firebase:firebase.app.App;
    // firebaseDb:firebase.database.Database;
    // constructor(firebase:firebase.app.App){
    //     this.firebase = firebase;
    //     this.firebaseDb = this.firebase.database();
    // }


    // getCurrentVulgeCollection(): Promise<FirebaseListObservable<any>> {
    //     //TODO determine if we want ActiveVulgeCollection be observable or promise.
    //     return this.getCurrentVulgeCollectionKey().then(collectionKey => {
    //         if (collectionKey) {
    //             return this.af.database.list(`/vulgeCollections/${collectionKey}/vulges`, { query: { orderByChild: 'votes', limitToLast: 25 } });
    //         }
    //     });

    // }
    // getActiveVulgeWinner(): FirebaseObjectObservable<any> {
    //     return this.af.database.object('/activeWinner');
    // }

    // getUserVulgeInfoCollection(userKey: string): FirebaseListObservable<any> {
    //     return this.af.database.list(`/userObjs/userVulgesInfo/${userKey}`);
    // }
    // getUserVulgeVotesCollection(userKey: string, vulgeKey: string): FirebaseListObservable<any> {
    //     return this.af.database.list(`/userObjs/userVulgesVotes/${userKey}/${vulgeKey}`);
    // }

    // getCurrentUserProfile(userKey: string, preserveSnapshot: boolean): FirebaseObjectObservable<any> {
    //     return this.af.database.object(`/userObjs/userProfiles/${userKey}/`, { preserveSnapshot: preserveSnapshot });
    // }

    // getCurrentUserVotes(userKey: string): FirebaseListObservable<any> {
    //     return this.af.database.list(`/userObjs/userVotes/${userKey}`);
    // }

    // getVulgeByKey(vulgeKey: string, preserveSnapshot: boolean): Promise<FirebaseObjectObservable<any>> {
    //     return this.getCurrentVulgeCollectionKey().then(collectionKey => {
    //         if (collectionKey) {
    //             return this.af.database.object(`/vulgeCollections/${collectionKey}/vulges/${vulgeKey}`, { preserveSnapshot: preserveSnapshot });
    //         }
    //     });

    // }

    // getUserNotificationCollection(userKey: string): FirebaseListObservable<any> {
    //     return this.af.database.list(`/userObjs/userNotifications/${userKey}`);
    // }
}