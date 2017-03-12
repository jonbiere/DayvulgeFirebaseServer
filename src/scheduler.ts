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
            cronTime: '* * * * * *',
            onTick: () => {
                console.log(`Job Ticked at ${new Date().toString()}`)
            },
            start:false,
            timeZone: 'America/Chicago'
        })

        vulgeWinnerJob.start();
    }
}