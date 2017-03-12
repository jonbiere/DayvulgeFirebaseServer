import * as firebase from "firebase-admin";

export class Scheduler{
    firebase:firebase.app.App;
    constructor(firebase:firebase.app.App){
        this.firebase = firebase;
    }

    public start(){
        //start jobs here
    }
}