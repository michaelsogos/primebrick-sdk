import { ExceptionFilter, Catch, HttpException, ArgumentsHost, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { throwError } from "rxjs";

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
	catch(error: Error, host: ArgumentsHost) {
		let status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		switch (host.getType()) {
			case "http":
				{
					let response: Response = host.switchToHttp().getResponse();
					response.status(status).json({
						statusCode: status,
						timestamp: new Date().toISOString(),
						message: error.message || "Internal Server Error",
					});
				}
				break;
			case "rpc": {
				return throwError({
					statusCode: status,
					timestamp: new Date().toISOString(),
					message: error.message || "Internal Server Error",
				});
			}
			case "ws":
				throw new Error("Not implemented yet!");
		}
	}
}
