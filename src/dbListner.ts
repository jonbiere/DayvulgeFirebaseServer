import * as firebase from "firebase-admin";
import {logger} from './logger'

export class DbListner{
    firebase:firebase.app.App;
    constructor(firebase:firebase.app.App){
        this.firebase = firebase;
    }

    public listen(){
        let firebaseDb = this.firebase.database();
        let listners = [];
        firebaseDb.ref('/activeCollection').on('value', activeCollection =>{
            if(activeCollection.exists())
            {
                logger.info(`Turning On DbListners`);
                listners = [];
                let collectionKey = Object.keys(activeCollection.val())[0];
                let vulgeCollectionRef = firebaseDb.ref(`/vulgeCollections/${collectionKey}/vulges`);
                listners.push(vulgeCollectionRef);

                vulgeCollectionRef.on('value', dataSnapshot =>{
                    logger.debug(`Vulges Changed for collection: ${collectionKey}`);
                })
                
            }
            else{
                if(listners && listners.length){
                    logger.info(`Turning Off DbListners`);
                    listners.forEach(dbRef => {
                       dbRef.off();
                       
                    });
                }
            }
        });      
    }
}