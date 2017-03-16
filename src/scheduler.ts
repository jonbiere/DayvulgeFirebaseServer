import * as firebase from "firebase-admin";
import * as cron from "cron";
import {logger} from './logger'
//import {vulgeWinner} from './jobs';


export class Scheduler {
    firebase: firebase.app.App;
    constructor(firebase: firebase.app.App) {
        this.firebase = firebase;
    }

    public start() {
        //start jobs here

        let vulgeWinnerJob = new cron.CronJob({
            cronTime: '0 */5 * * * *',
            onTick: () => { this.vulgeWinner() },
            start: false,
            timeZone: 'America/Chicago'
        })

        vulgeWinnerJob.start();
    }

    vulgeWinner() {
        logger.info(`Job Ticked at ${new Date().toString()}`);

        let firebaseDb = this.firebase.database();

        //grab active key
        firebaseDb.ref('/activeCollection').once('value', triggeredCollection => {
            let triggeredKey = Object.keys(triggeredCollection.val())[0];
            //turn off isActive
            firebaseDb.ref(`/vulgeCollections/${triggeredKey}`).update({
                isActive: false
            }).then(() => {
                //clear active key
               firebaseDb.ref('/activeCollection').set(null).then(() => {                                  
                    //determine winner
                    //TODO handle tie breakers
                    firebaseDb.ref(`/vulgeCollections/${triggeredKey}/vulges`).orderByChild('votes').limitToLast(1).once('value', dataSnapshot => {
                        let winnerObj:any
                        if (dataSnapshot.exists() && dataSnapshot.hasChildren()) {
                            winnerObj = dataSnapshot.val();
                            let key = Object.keys(winnerObj)[0];

                            logger.info(`Winner: ${JSON.stringify(winnerObj)}`);                          
                            firebaseDb.ref(`/winners/${key}`).set(winnerObj[key]);
                            firebaseDb.ref('/activeWinner').set(winnerObj[key]);

                        }
                        else{
                            winnerObj = {
                                createdDate: firebase.database['ServerValue']['TIMESTAMP'],
                                vulgeText: 'Today will not be remembered....',
                                userName: 'Nobody',
                                userKey: null
                            }
                            firebaseDb.ref(`/winners/`).push(winnerObj);
                            firebaseDb.ref('/activeWinner').set(winnerObj);
                        }
                        
                        //generate new vulgeCollections key
                        let freshRef = firebaseDb.ref('/activeCollection').push(0);
                        firebaseDb.ref(`/vulgeCollections/${freshRef.key}`).set({
                            date: firebase.database['ServerValue']['TIMESTAMP'],
                            isActive: true
                        });
                        
                    });
                });

            })


        })
    }
}