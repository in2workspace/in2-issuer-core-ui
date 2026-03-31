import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';
import { inject, Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class ServeErrorInterceptor implements HttpInterceptor {
  private readonly dialog = inject(DialogWrapperService);
  private readonly translate = inject(TranslateService);

  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // ignore IAM endpoint; its errors are handled in a lower level
        if (typeof environment.iam_url === 'string' && request.url.startsWith("https://verifier.green.eudistack.net")) {
          this.logHandledSilentlyError(error);
          return throwError(() => error);
        }
        let errorMessage: string;
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = this.getServerErrorMessage(error);
        }
        const translatedMessage = this.translate.instant(errorMessage);
        this.dialog.openErrorInfoDialog(DialogComponent, translatedMessage);
        
        return throwError(() => error);
      })
    );
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 404:
        return 'error.not_found';
      case 401:
        return 'error.unauthorized';
      case 403:
        return 'error.forbidden';
      case 500:
        return 'error.internal_server';
      default:
        return 'error.unknown_error';
    }
  }

  private logHandledSilentlyError(error: Error): void{
    console.error('Handled silently:');
    console.error(error);
  }
}
