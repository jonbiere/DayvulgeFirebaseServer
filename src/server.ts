import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as path from "path";
import * as firebase from "firebase-admin";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import { Scheduler } from './scheduler';
import { DbListner } from './dbListner';
import { logger } from './logger'
import * as cors from "cors";

import { IndexRoute, VoteRoute } from "./routes";

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;
  private firebase: firebase.app.App;

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    //create expressjs application
    this.app = express();

    //configure application
    this.config();

    //add routes
    //this.routes();

    //add api
    this.api();
  }

  /**
   * Create REST API routes
   *
   * @class Server
   * @method api
   */
  public api() {
    let router: express.Router;
    router = express.Router();
    //router.options.
    //IndexRoute
    IndexRoute.create(router);
    VoteRoute.create(router, this.firebase);


    //use router middleware
    this.app.use('/api', router);
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  public config() {
    //setup cors
    let originsWhiteList = [
      'http://localhost:3000',
      'https://dev.dayvulge.com'
      //'https://dayvulge-27f09.firebaseapp.com'
    ];

    let corsOption: cors.CorsOptions = {
      origin: (origin, callback) => {
        callback(null, originsWhiteList.indexOf(origin) !== -1)
      },
      credentials: true
    }
    this.app.use(cors(corsOption));

    //add static paths
    this.app.use(express.static(path.join(__dirname, "public")));

    //configure pug
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "pug");

    //mount json form parser
    this.app.use(bodyParser.json());

    //mount query string parser
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    //mount cookie parker
    //this.app.use(cookieParser("SECRET_GOES_HERE"));

    //mount override?
    this.app.use(methodOverride());

    // catch 404 and forward to error handler
    this.app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
      err.status = 404;
      next(err);
    });

    //error handling
    this.app.use(errorHandler());

    //initialize firebase
    this.firebase = this.initFirebase();
    
    //start up scheduled jobs
    let firebaseScheduler = new Scheduler(this.firebase);
    firebaseScheduler.start();  
  }

  private initFirebase(): firebase.app.App {
    logger.debug("Initializing firebase...")
    let serviceAccount = require("../dayvulgeAdminKey.json");
    return firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount),
      databaseURL: 'https://dayvulge-27f09.firebaseio.com'
    });
  }
  /**
   * Create and return Router.
   *
   * @class Server
   * @method config
   * @return void
   */
  private routes() {
    //empty for now. use seperate view router if desired.
  }

}