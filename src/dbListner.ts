import * as firebase from "firebase-admin";

export class DbListner{
    firebase:firebase.app.App;
    constructor(firebase:firebase.app.App){
        this.firebase = firebase;
    }

    public listen(){
        let collectionKey = 'testCollection';
        this.firebase.database().ref(`/vulgeCollections/${collectionKey}/vulges`).on('value', dataSnapshot =>{
            console.log('Vulges Changed!');
        });
    }
}