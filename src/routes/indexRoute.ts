import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./baseRoute";
import { logger } from '../logger'

/**
 * / route
 *
 * @class User
 */
export class IndexRoute extends BaseRoute {

  /**
   * Create the routes.
   *
   * @class IndexRoute
   * @method create
   * @static
   */
  public static create(router: Router) {
    //log
    logger.debug("[IndexRoute::create] Creating index route.");

    //add home page route
    router.get("/", (req: Request, res: Response, next: NextFunction) => {
      new IndexRoute(req, res, next).get();
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
   * The home page route.
   *
   */
  public get() {

    //set message
    let options: Object = {
      "message": "Online",
      "title": "Api Status"
    };

    //render template
    this.sendView("index", options);
  }
}