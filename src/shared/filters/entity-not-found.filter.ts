import { ArgumentsHost, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from "express";

export class EntityNotFoundFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();

    response.status(404).send({
      statusCode: 404,
      message: exception.message.replace("entity of type ", "").replace(/"/g, ""),
    });
  }
}
