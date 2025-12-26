import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    // Request received log
    this.logRequest(request);

    return next.handle().pipe(
      tap(() => {
        // Response success log
        this.logResponse(request, response);
      }),
    );
  }

  private logRequest(request: any): void {
    this.logger.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        message: 'Request received',
        requestId: request.id,
        endpoint: request.originalUrl || request.url,
        method: request.method,
        ip: request.ip || request.socket?.remoteAddress || request.headers['x-forwarded-for'],
        userAgent: request.headers['user-agent'],
      }),
    );
  }

  private logResponse(request: any, response: any): void {
    this.logger.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        message: 'Request completed successfully',
        requestId: request.id,
        userId: request.user?.id,
        endpoint: request.originalUrl || request.url,
        method: request.method,
        statusCode: response.statusCode || 200,
      }),
    );
  }
}
