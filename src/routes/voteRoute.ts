import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./baseRoute";
import { logger } from '../logger';
import * as firebase from "firebase-admin";
import { HTTP_STATUS_CODES } from "./statusCodes";
import {NotificationModel, NotificationType} from '../models';


/**
 * / route
 *
 * @class User
 */
export class VoteRoute extends BaseRoute {

  private static firebase: firebase.app.App;

  /**
   * Create the routes.
   *
   * @class IndexRoute
   * @method create
   * @static
   */
  public static create(router: Router, firebase: firebase.app.App) {
    //log
    logger.debug("[VoteRoute::create] Creating index route.");

    this.firebase = firebase;

    //add home page route
    router.post("/vote", (req: Request, res: Response, next: NextFunction) => {
      new VoteRoute(req, res, next).post();
    });
  }

  /**
   * Constructor
   *
   * @class IndexRoute
   * @constructor
   */
  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

  }

  /**
   * The vote post
   */
  public post() {

    let token = this.req.body.userToken;
    let vulgeKey = this.req.body.vulgeKey;

    if (token && vulgeKey) {
      VoteRoute.firebase.auth().verifyIdToken(token).then(decodedToken => {
        let userKey = decodedToken.uid;
        let firebaseDb = VoteRoute.firebase.database();
        try {
          //get active collection key
          firebaseDb.ref('/activeCollection').once('value', activeCollection => {
            if (activeCollection.exists()) {
              let collectionKey = Object.keys(activeCollection.val())[0];
              let vulgeRef = firebaseDb.ref(`/vulgeCollections/${collectionKey}/vulges/${vulgeKey}`);
              //get vulge
              vulgeRef.once('value', vulge => {
                if (vulge.exists()) {                
                  let userProfileRef = firebaseDb.ref(`/userObjs/userProfiles/${userKey}/`);
                  //get userprofile
                  userProfileRef.once('value', userProfile => {
                    let profile = userProfile.val();
                    if (userProfile.exists() && profile.votes > 0) {
                      VoteRoute.firebase.auth().getUser(userKey).then(currentUserObj => {
                        userProfileRef.update({
                          votes: --profile.votes
                        })
                        let up = this.req.body.up;
                        vulgeRef.update({
                          votes: up ? ++vulge.val().votes : --vulge.val().votes
                        });
                        this.registerVulgeVote(firebaseDb, vulge, currentUserObj, up);
                        this.registerUserVote(firebaseDb, vulge, currentUserObj, up);
                        this.registerVoteNotification(firebaseDb, vulge, currentUserObj, up);   
                        
                        this.sendJson({success:true});                    
                      })
                    }
                    else {
                      throw new Error("User not found");
                    }
                  });
                }
                else {
                  this.sendJson({ success:false, message: "Voting period ended." });
                }
              });
            }
            else {
              this.sendJson({success:false, message: "Voting period ended." });
            }
          });
        }
        catch (e) { this.sendError(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR); }
      },
        error => { this.sendError(HTTP_STATUS_CODES.UNAUTHORIZED) }
      );
    }
    else {
      this.sendError(HTTP_STATUS_CODES.BAD_REQUEST);
    }
  }

  private registerVulgeVote(firebaseDb: firebase.database.Database, vulge: firebase.database.DataSnapshot, currentUserObj: firebase.auth.UserRecord, up: boolean) {
    firebaseDb.ref(`/userObjs/userVulgesVotes/${vulge.val().userKey}/${vulge.key}`).push({
      userKey: currentUserObj.uid,
      voteUp: up,
      profilePic: currentUserObj.photoURL || ""
    });
  }

  private registerUserVote(firebaseDb: firebase.database.Database, vulge: firebase.database.DataSnapshot, currentUserObj: firebase.auth.UserRecord, up: boolean) {
    firebaseDb.ref(`/userObjs/userVotes/${currentUserObj.uid}/${vulge.key}`).once('value', userVote => {
      if (userVote.exists()) {
        let userVoteObj = userVote.val();
        if (up) {
          userVoteObj.numUpVotes = userVoteObj.numUpVotes ? ++userVoteObj.numUpVotes : 1;
        }
        else {
          userVoteObj.numDownVotes = userVoteObj.numDownVotes ? ++userVoteObj.numDownVotes : 1;
        }
        userVoteObj.voteDate = firebase.database.ServerValue.TIMESTAMP;
        firebaseDb.ref(`/userObjs/userVotes/${currentUserObj.uid}/${vulge.key}`).update(userVoteObj);
      }
      else {
        let vulgeData = vulge.val();
        firebaseDb.ref(`/userObjs/userVotes/${currentUserObj.uid}/${vulge.key}`).set({
          vulgeUserName: vulgeData.userName,
          profilePic: "",
          vulgeText: vulgeData.vulgeText,
          voteDate: firebase.database.ServerValue.TIMESTAMP,
          numUpVotes: up ? 1 : 0,
          numDownVotes:up ? 0 : 1   
        });
        
      }});
  }

  private registerVoteNotification(firebaseDb: firebase.database.Database, vulge: firebase.database.DataSnapshot, currentUserObj: firebase.auth.UserRecord, up: boolean) {
    firebaseDb.ref(`/userObjs/userNotifications/${vulge.val().userKey}`).push(
      new NotificationModel(vulge.val().userKey,
        currentUserObj.email,
        firebase.database.ServerValue.TIMESTAMP,
        up ? NotificationType.UpVote : NotificationType.DownVote));
  }
}

