import * as firebase from "firebase-admin";
import * as cron from "cron";
//import {vulgeWinner} from './jobs';


export class Scheduler {
    firebase: firebase.app.App;
    constructor(firebase: firebase.app.App) {
        this.firebase = firebase;
    }

    public start() {
        //start jobs here

        let vulgeWinnerJob = new cron.CronJob({
            cronTime: '5 * * * * *',
            onTick: () => { this.vulgeWinner() },
            start: false,
            timeZone: 'America/Chicago'
        })

        vulgeWinnerJob.start();
    }

    vulgeWinner() {
        console.log(`Job Ticked at ${new Date().toString()}`);

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
                    //generate new vulgeCollections key
                    let freshRef = firebaseDb.ref('/activeCollection').push(0);
                    firebaseDb.ref(`/vulgeCollections/${freshRef.key}`).set({
                        date: firebase.database['ServerValue']['TIMESTAMP'],
                        isActive: true
                    })
                    

                    //determine winner
                    //TODO handle tie breakers
                    firebaseDb.ref(`/vulgeCollections/${triggeredKey}/vulges`).orderByChild('votes').limitToLast(1).once('value', dataSnapshot => {
                        if (dataSnapshot.exists() && dataSnapshot.hasChildren()) {
                            let winner = dataSnapshot.val();
                            let key = Object.keys(winner)[0];

                            console.log(`Winner: ${JSON.stringify(winner)}`);

                            let winnerCollection = this.firebase.database().ref(`/winners/${key}`);
                            winnerCollection.set(winner[key]);
                        }
                        else{
                            //TODO handle no vulges made for the day
                        }
                    });
                });

            })


        })
    }
}