import * as firebase from "firebase-admin";
import * as cron from "cron";
//import {vulgeWinner} from './jobs';


export class Scheduler{
    firebase:firebase.app.App;
    constructor(firebase:firebase.app.App){
        this.firebase = firebase;
    }

    public start(){
        //start jobs here

        let vulgeWinnerJob = new cron.CronJob({
            cronTime: '30 * * * * *',
            onTick: () => {this.vulgeWinner()},
            start:false,
            timeZone: 'America/Chicago'
        })

        vulgeWinnerJob.start();
    }

    vulgeWinner(){
        console.log(`Job Ticked at ${new Date().toString()}`)
        let collectionKey = 'testCollection';
       

         this.firebase.database().ref(`/vulgeCollections/${collectionKey}/vulges`).orderByChild('votes').limitToLast(1).once('value', dataSnapshot =>{
             let winner = dataSnapshot.val();
            
             console.log(`Winner!: ${JSON.stringify(winner)}`);
        });
    }
}