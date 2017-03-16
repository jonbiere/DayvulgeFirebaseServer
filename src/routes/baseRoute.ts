import { NextFunction, Request, Response } from "express";
import{HTTP_STATUS_CODES} from "./statusCodes";
/**
 * Constructor
 *
 * @class BaseRoute
 */
export class BaseRoute {
  protected req: Request;
  protected res: Response;
  protected next: NextFunction;


  /**
   * Constructor
   *
   * @class BaseRoute
   * @constructor
   */
  constructor(req: Request, res: Response, next: NextFunction) {
   this.req = req;
   this.res = res;
   this.next = next;
  }

  /**
   * Render a page.
   */
  public sendView(view: string, options?: Object) {
    //render view    
    this.res.render(view, options);
  }

  public sendError(statusCode:HTTP_STATUS_CODES, message?:string){
    this.res.json(statusCode, {error: message || HTTP_STATUS_CODES[statusCode]});
  }

  public sendJson(jsonObj:any){
    this.res.json(HTTP_STATUS_CODES.OK, jsonObj);
  }


}