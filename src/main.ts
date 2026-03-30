import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { environment } from 'src/environments/environment';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { ServeErrorInterceptor } from './app/core/interceptors/server-error-interceptor';
import { AuthInterceptor, AuthModule } from 'angular-auth-oidc-client';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { RouterModule } from "@angular/router";
import { routes } from "./app/app-routing";
import { httpTranslateLoader } from "./app/core/services/translate-http-loader.factory";
import { overrideDefaultValueAccessor } from './app/core/overrides/value-accessor.overrides';
import { IAM_PARAMS, IAM_POST_LOGIN_ROUTE, IAM_POST_LOGOUT_URI, IAM_REDIRECT_URI } from './app/core/constants/iam.constants';
import { CREDENTIAL_SCHEMA_PROVIDERS } from './app/features/credential-issuance/services/issuance-schema-builders/issuance-schema-builder';
import { LearCredentialEmployeeSchemaProvider } from './app/features/credential-issuance/services/issuance-schema-builders/lear-credential-employee-issuance-schema-provider';
import { LearCredentialMachineIssuanceSchemaProvider } from './app/features/credential-issuance/services/issuance-schema-builders/lear-credential-machine-issuance-schema-provider';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorIntlService } from './app/shared/services/mat-paginator-intl.service';
import { applyInitialTheme } from './app/core/theme/theme-loader';


overrideDefaultValueAccessor();

applyInitialTheme();

bootstrapApplication(AppComponent, {
    providers: [
        {
            provide: CREDENTIAL_SCHEMA_PROVIDERS,
            useClass: LearCredentialEmployeeSchemaProvider,
            multi: true
        },
        {
            provide: CREDENTIAL_SCHEMA_PROVIDERS,
            useClass: LearCredentialMachineIssuanceSchemaProvider,
            multi: true
        },
        {
            provide: MatPaginatorIntl,
            useClass: MatPaginatorIntlService
        },
        importProvidersFrom(BrowserModule, RouterModule.forRoot(routes), TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpTranslateLoader,
                deps: [HttpClient]
            }
        }), AuthModule.forRoot({
            config: {
                // Add "logLevel: 1" to see library logs
                postLoginRoute: IAM_POST_LOGIN_ROUTE,
                authority: "https://verifier.green.eudistack.net",
                redirectUrl: IAM_REDIRECT_URI,
                postLogoutRedirectUri: IAM_POST_LOGOUT_URI,
                clientId: "green-issuer-logout-test",
                scope: IAM_PARAMS.SCOPE,
                responseType: IAM_PARAMS.GRANT_TYPE,
                silentRenew: true,
                useRefreshToken: true,
                historyCleanupOff: false,
                ignoreNonceAfterRefresh: true,
                triggerRefreshWhenIdTokenExpired: false,
                secureRoutes: [environment.server_url, environment.iam_url, "https://verifier.green.eudistack.net"].filter((route): route is string => route !== undefined)
            },
        })),
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ServeErrorInterceptor, multi: true },
        provideAnimations(),
    ]
})
  .catch(err => console.error(err));
