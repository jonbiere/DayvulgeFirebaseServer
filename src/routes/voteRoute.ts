import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./baseRoute";
import { logger } from '../logger';
import * as firebase from "firebase-admin";
import { HTTP_STATUS_CODES } from "./statusCodes";


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

    if (token) {
      VoteRoute.firebase.auth().verifyIdToken(token).then(decodedToken => {
        let userId = decodedToken.uid;

        this.sendError(HTTP_STATUS_CODES.FOUND);
      },
        error => {
          this.sendError(HTTP_STATUS_CODES.UNAUTHORIZED)
        }
      );  
    }
    else {
      this.sendError(HTTP_STATUS_CODES.BAD_REQUEST);
    }
  }
}