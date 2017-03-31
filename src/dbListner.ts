import * as firebase from "firebase-admin";
import {logger} from './logger'

export class DbListner{
    firebase:firebase.app.App;
    listners:Array<firebase.database.Reference>;
    isListening:boolean;
    constructor(firebase:firebase.app.App){
        this.firebase = firebase;
        this.isListening = false;
    }

    public listen(){
        if(!this.isListening){
            logger.info(`Turning On DbListners`);
            this.isListening = true;
            let firebaseDb = this.firebase.database();
            let listners = [];
            let activeCollectionRef = firebaseDb.ref('/activeCollection')
            activeCollectionRef.once('value', activeCollection =>{
                if(activeCollection.exists())
                {                   
                    listners = [];
                    let collectionKey = Object.keys(activeCollection.val())[0];
                    let vulgeCollectionRef = firebaseDb.ref(`/vulgeCollections/${collectionKey}/vulges`);
                    
                    let countRef = activeCollectionRef.child(`${collectionKey}`);
                    vulgeCollectionRef.on('child_added', dataSnapshot =>{
                        logger.debug(`Vulges created for collection: ${collectionKey}`);
                        countRef.transaction(count =>{
                            if(count || count === 0){
                                count++;
                            }
                            return count;
                        });
                    });
                    listners.push(vulgeCollectionRef);
                    listners.push(countRef);
                }
                else{
                    logger.error('Db Listner: Active Collection Not found.')
                }
            });  
        }    
    }


    turnOff(){
        this.isListening = false;
        logger.info(`Turning Off DbListners`);
         if(this.listners && this.listners.length){                  
            this.listners.forEach(dbRef => {
                dbRef.off();                     
            });
        }
    }
}