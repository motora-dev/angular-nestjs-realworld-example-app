import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    // ① リクエスト受信ログ
    this.logRequest(request);

    return next.handle().pipe(
      tap(() => {
        // ② レスポンス成功ログ
        this.logResponse(request, response);
      }),
      catchError((error) => {
        // ③ エラー発生ログ
        this.logError(request, error);
        return throwError(() => error);
      }),
    );
  }

  private logRequest(request: any): void {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
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
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'Request completed successfully',
        requestId: request.id,
        userId: request.user?.id,
        endpoint: request.originalUrl || request.url,
        method: request.method,
        statusCode: response.statusCode || 200,
      }),
    );
  }

  private logError(request: any, error: any): void {
    const status = error.status || error.statusCode || 500;
    const message = error.message || 'Unknown error occurred';

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: `Request failed with status ${status}`,
        requestId: request.id,
        userId: request.user?.id,
        endpoint: request.originalUrl || request.url,
        method: request.method,
        statusCode: status,
        error: message,
        stack: error.stack,
      }),
    );
  }
}
