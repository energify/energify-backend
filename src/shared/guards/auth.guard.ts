import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { verify as verifyJwt, decode as decodeJwt } from "jsonwebtoken";
import { IS_PUBLIC } from "../decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private configService: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as Request;
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC, context.getClass());

    if (isPublic) {
      return true;
    } else if (!request.header("authorization")) {
      return false;
    }

    const bearer = request.header("authorization").replace("Bearer ", "");
    const isValidBearer = !!verifyJwt(bearer, this.configService.get<string>("JWT_SECRET"));

    if (isValidBearer) {
      (request as any).user = decodeJwt(bearer);
      return true;
    }

    return false;
  }
}
