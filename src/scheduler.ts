import * as firebase from "firebase-admin";
import * as cron from "cron";
import { logger } from './logger'
import {DbListner} from './dbListner';
//import {vulgeWinner} from './jobs';


export class Scheduler {
    firebase: firebase.app.App;
    firebaseDb: firebase.database.Database;
    dbListner: DbListner;
    constructor(firebase: firebase.app.App) {
        this.firebase = firebase;
        this.firebaseDb = this.firebase.database();
        
        //start up firebase event listening
        this.dbListner = new DbListner(this.firebase);
    
    }

    public start() {
        //start jobs here

        let vulgeWinnerCronJob = new cron.CronJob({
            cronTime: '0 */15 * * * *',
            onTick: () => { this.vulgeWinnerJob() },
            start: false,
            timeZone: 'America/Chicago'
        })

        //vulgeWinnerCronJob.start();
        this.dbListner.listen();
    }

    vulgeWinnerJob() {
        logger.info(`Job Ticked at ${new Date().toString()}`);

        //grab active key
        let activeCollectionRef = this.firebaseDb.ref('/activeCollection')
        activeCollectionRef.once('value', triggeredCollection => {
            let triggeredKey = Object.keys(triggeredCollection.val())[0];
            //turn off isActive
            this.firebaseDb.ref(`/vulgeCollections/${triggeredKey}`).update({
                isActive: false
            }).then(() => {
                //clear active key
                activeCollectionRef.set(null).then(() => {
                     this.dbListner.turnOff();
                    this.findWinningVulge(triggeredKey);
                });
            })
        })
    }

    private findWinningVulge(triggeredKey: string) {
        //TODO handle tie breakers
        this.firebaseDb.ref(`/vulgeCollections/${triggeredKey}/vulges`).orderByChild('votes').limitToLast(1).once('value', dataSnapshot => {
            let winnerObj: any
            if (dataSnapshot.exists() && dataSnapshot.hasChildren()) {
                winnerObj = dataSnapshot.val();
                let key = Object.keys(winnerObj)[0];

                logger.info(`Winner: ${JSON.stringify(winnerObj)}`);
                this.firebaseDb.ref(`/winners/${key}`).set(winnerObj[key]);
                this.firebaseDb.ref('/activeWinner').set(winnerObj[key]);
            }
            else {
                winnerObj = {
                    createdDate: firebase.database['ServerValue']['TIMESTAMP'],
                    vulgeText: 'Today will not be remembered....',
                    userName: 'Nobody',
                    userKey: null
                }
                this.firebaseDb.ref('/winners/').push(winnerObj);
                this.firebaseDb.ref('/activeWinner').set(winnerObj);
            }

            this.createNewVulgeCollection();
            this.resetUserVotes();

        });
    }

    private resetUserVotes() {
        let profilesRef = this.firebaseDb.ref('/userObjs/userProfiles');
        profilesRef.once('value', userProfilesSnap =>{
             if(userProfilesSnap.exists()){
                 let userProfiles = userProfilesSnap.val();
                 let keys = Object.keys(userProfiles);
                 keys.forEach(key =>{
                    let profile = userProfiles[key];
                    profile.votes = 5;
                 });
                 profilesRef.update(userProfiles);
             }
        });
        
        let userVotesRef = this.firebaseDb.ref('/userObjs/userVotes');
        userVotesRef.once('value', userVotesSnap =>{
            if(userVotesSnap.exists()){
                let allUserVotes = userVotesSnap.val();
                let userKeys = Object.keys(allUserVotes);
                userKeys.forEach(userKey => {
                    let userVotes = allUserVotes[userKey];
                    let userVoteKeys = Object.keys(userVotes);
                    userVoteKeys.forEach(userVoteKey =>{
                        userVotes[userVoteKey].hasSeen = true;
                    });
                });
                userVotesRef.update(allUserVotes);
            }
        })

    }

    private createNewVulgeCollection() {
        //generate new vulgeCollections key
        let freshRef = this.firebaseDb.ref('/activeCollection').push(0);
        this.firebaseDb.ref(`/vulgeCollections/${freshRef.key}`).set({
            date: firebase.database['ServerValue']['TIMESTAMP'],
            isActive: true
        }).then(() =>{
            this.dbListner.listen();
        });
    }
}