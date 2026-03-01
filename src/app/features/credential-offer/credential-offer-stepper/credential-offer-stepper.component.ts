import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CredentialOfferComponent } from '../credential-offer-steps/credential-offer/credential-offer.component';
import { CredentialOfferOnboardingComponent } from '../credential-offer-steps/credential-offer-onboarding/credential-offer-onboarding.component';
import { Component, computed, DestroyRef, effect, inject, OnInit, Signal, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { catchError, delayWhen, EMPTY, filter, interval, map, merge, Observable, of, scan, shareReplay, startWith, Subject, switchMap, take, takeUntil, tap, throwError, timer } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { HttpErrorResponse } from '@angular/common/http';
import { BreakpointObserver } from '@angular/cdk/layout';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CredentialOfferResponse } from 'src/app/core/models/dto/credential-offer-response.dto';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { TemplatePortal } from '@angular/cdk/portal';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';
import { DialogData } from 'src/app/shared/components/dialog/dialog-data';

export type StepperIndex = 0 | 1;
export type CredentialOfferStep = 'onboarding' | 'offer';
export interface CredentialOfferParams {
  credential_offer_uri: string|undefined,
  transaction_code: string|undefined,
  c_transaction_code: string|undefined,
  c_transaction_code_expires_in: number|undefined //expected in seconds
}
export interface CredentialOfferParamsState extends CredentialOfferParams {
  loading: boolean,
  error: boolean
}

export const undefinedCredentialOfferParamsState: CredentialOfferParamsState = { 
    credential_offer_uri: undefined,
    transaction_code: undefined,
    c_transaction_code: undefined,
    c_transaction_code_expires_in: undefined,
    loading: false,
    error: false
  };

  //REFRESH-SESSION RELATED CONSTANTS
  type StartOrEnd = 'START' | 'END';
  //time before refresh offer popup is shown
  export const defaultTotalAvailableTimeInMs = 60 * 1000 * 9; // 9min in miliseconds
  //countdown for the refresh offer popup; when it comes to 0, redirects to home
  export const popupTimeInSeconds = 60; //in seconds; should always be 60s
  export const loadingBufferTimeInMs = 25 * 1000; //margin to compensate for loading time 

@Component({
    selector: 'app-credential-offer-stepper',
    imports: [
        AsyncPipe,
        CredentialOfferComponent,
        CredentialOfferOnboardingComponent,
        MatButtonModule,
        MatIcon,
        MatProgressSpinnerModule,
        MatStepperModule,
        TranslatePipe
    ],
    providers: [{
            provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
        }],
    templateUrl: './credential-offer-stepper.component.html',
    styleUrl: './credential-offer-stepper.component.scss'
})
export class CredentialOfferStepperComponent implements OnInit{
  @ViewChild('popupCountdown') popupCountdown!: TemplateRef<any>;
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly credentialProcedureService = inject(CredentialProcedureService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(DialogWrapperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);


  //Subjects
  public getInitUrlParams$$ = new Subject<void>();
  public updateIndex$$ = new Subject<StepperIndex>();
  public loadCredentialOfferOnRefreshClick$$ = new Subject<void>();
  public destroy$$ = new Subject<void>();
  
  //Offer effects
  public updateUrlParamsOnOfferChangeEffect = effect(()=> {
    const offer = this.offerParams$();
    this.updateUrlParams(offer);
  });

  //Derived streams
  public currentIndex$ = toSignal<StepperIndex>(this.updateIndex$$.pipe(startWith(0 as StepperIndex)));
  public currentStep$ = computed<CredentialOfferStep>(() => {
    return this.currentIndex$() === 0 ? 'onboarding' : 'offer';
  });
  public initUrlParams$: Observable<CredentialOfferParams> = this.getInitUrlParams$$.pipe(
    map(()=>{
      return this.getUrlParams()}
  ));

  public fetchedCredentialOffer$: Observable<Partial<CredentialOfferParamsState>> = 
  merge(
    this.loadCredentialOfferOnRefreshClick$$, 
    this.updateIndex$$.pipe(filter(() => this.currentIndex$() === 1)))
  .pipe(
    switchMap(()=>this.getCredentialOffer().pipe(
      map(params => ({...params, loading: false, error: false })),
      catchError(error => { 
        console.error(error);
        return of({ 
          loading: false,
          error: true
        })
      }),
      startWith({
        loading: true,
        error: false
      })
    )),
    shareReplay(1)
  );

  public offerParams$: Signal<CredentialOfferParamsState> = toSignal(
    merge(this.initUrlParams$, this.fetchedCredentialOffer$)
    .pipe(
      scan(
        (previousState, nextState) => ({
          ...previousState,
          ...nextState
        }),
        undefinedCredentialOfferParamsState
      )
  ), 
  { initialValue: undefinedCredentialOfferParamsState }); //this is needed because the seed value in scan() is not emitted

  public stepperOrientation$ = toSignal(this.breakpointObserver
    .observe('(min-width: 800px)')
    .pipe(map(({matches}) => (matches ? 'horizontal' : 'vertical'))),
  {
    initialValue: 'horizontal'
  });

  //EXPIRATION-RELATED STREAMS
  //when this startOrEndFirstCountdown$ emits 'START', refresh popup is closed and the endsession countdown starts
  //when it emits 'END', the popup is closed and the countdown is interrupted
  //if user clicks to refresh session, new offer params are fetched, which makes restart the previous flow
  //if there is an error when refreshing session, user is redirected to home
  //if user clicks to leave session, user is redirected to home
  private readonly startOrEndFirstCountdown$: Observable<StartOrEnd> = this.fetchedCredentialOffer$
  .pipe(
    filter(offerState => (offerState.loading === false) && (offerState.error === false)),
    switchMap(offerParams => {
      const totalAvailableTimeFromBackendInSeconds = offerParams.c_transaction_code_expires_in;
      let totalAvailableTimeInMs: number;
      if(!totalAvailableTimeFromBackendInSeconds){
        console.error('Offer expiration time not received from API; using default: ' + defaultTotalAvailableTimeInMs + ' - ' + loadingBufferTimeInMs);
        totalAvailableTimeInMs = defaultTotalAvailableTimeInMs;
      }else{
        totalAvailableTimeInMs = (totalAvailableTimeFromBackendInSeconds * 1000);
      }
      return timer(totalAvailableTimeInMs - (popupTimeInSeconds * 1000) - loadingBufferTimeInMs).pipe(
        map(() => 'END' as StartOrEnd),
        startWith('START' as StartOrEnd)
      )
    }),
    shareReplay(1)
  );

  private readonly openRefreshPopupEffect = this.startOrEndFirstCountdown$.pipe(
    filter( val => val === 'END'),
    tap(() => {
      const dialogRef = this.dialog.openDialogWithCallback<DialogData, DialogComponent>(DialogComponent, {
        title: this.translate.instant('credentialOffer.expired-title'), 
        message: '',
        template: new TemplatePortal(this.popupCountdown, {} as ViewContainerRef),
        confirmationType: 'async',
        status: 'default', //error?
        confirmationLabel: 'Refresh',
        cancelLabel: 'Leave'
      }, 
      //after confirmation callback
      () => {
        this.onRefreshCredentialClick(); 
        return EMPTY;
      }, 
      //cancel callback will be handled here to allow the afterClosed to be unsubscribed on destroy
      undefined,
      'DISABLE_CLOSE'
    );
    
    const cancelCallback = () => {
      this.redirectToHomeAndShowErrorDialog("error.credentialOffer.not-found");
      return EMPTY;
    };

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$$),
      take(1), 
      filter(val => val === false),
      switchMap(cancelCallback)).subscribe({
      next: () => { 
        console.info('Cancel callback completed');
      },
      error: err => {
        console.error(err);
      },
      complete: () => {
        console.info('Cancel callback completed');
      }
    });

  })
    );

  private readonly closeRefreshPopupEffect = this.startOrEndFirstCountdown$.pipe(
    filter( val => val === 'START'),
    tap(() => {
      this.dialog['dialog'].closeAll();
    })
  );

  public readonly endSessionCountdown$ = this.startOrEndFirstCountdown$.pipe(
    switchMap(startOrEnd => {
      if(startOrEnd === 'END'){
        return interval(1000).pipe(
          take(popupTimeInSeconds + 2),
          map(consumedSeconds => popupTimeInSeconds - consumedSeconds),
          delayWhen(()=>
            this.fetchedCredentialOffer$.pipe(
              filter(state => state.loading === false),
            ))
        )
      }else{
        return of(popupTimeInSeconds);
      }
    })
  )

  private readonly navigateHomeAfterEndSessionEffect = this.endSessionCountdown$.pipe(
    filter(time => time === -1),
    tap(()=>{
      this.redirectToHome();
      this.dialog.openErrorInfoDialog(DialogComponent, this.translate.instant("error.credentialOffer.not-found"));
    })
  );

  //END EXPIRATION TIME STREAMS

  public ngOnInit(): void {
    this.getInitUrlParams$$.next();
    
    merge(
      this.openRefreshPopupEffect,
      this.closeRefreshPopupEffect,
      this.navigateHomeAfterEndSessionEffect
    )
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe();
  }

  private ngOnDestroy(): void{
    this.destroy$$.next();
  }

  public onSelectedStepChange(index:number){
    if(((index !== 0) && (index !== 1))){
      console.error('Unexpected index');
    }else if (index !== this.currentIndex$()) {
      this.updateIndex$$.next(index);
    }
  }

  public getUrlParams(): CredentialOfferParamsState{
    const params = this.route.snapshot.queryParams;
    const transactionCodeParam = params['transaction_code'];
    const cCodeParam = params['c'];

    if(!transactionCodeParam){
      console.error("Client error: Missing transaction code in the URL. Can't get credential offer.");
      
      this.translate.get("error.credentialOffer.invalid-url")
      .pipe(take(1))
      .subscribe((message:string)=>{
        this.dialog.openErrorInfoDialog(DialogComponent, message);
        this.redirectToHome();
        }
      );
    }
    const updatedParams: CredentialOfferParamsState = {
      credential_offer_uri: undefined,
      transaction_code: transactionCodeParam,
      c_transaction_code: cCodeParam,
      c_transaction_code_expires_in: undefined,
      loading: false,
      error: false
    };
    return updatedParams;
  }

  public getCredentialOffer(): Observable<Partial<CredentialOfferParams>>{
    const offer = this.offerParams$();
    let params: Observable<Partial<CredentialOfferParams>> = throwError(()=>new Error('No transaction nor c code to fetch credential offer.'));
    
    if(offer?.c_transaction_code){
      params = this.getCredentialOfferByCTransactionCode(offer.c_transaction_code);
    }else if(offer?.transaction_code){
      params = this.getCredentialOfferByTransactionCode(offer.transaction_code);
    }else{
      this.redirectToHome();
      console.error("Client error: Transaction code not found. Can't get credential offer");
      const message = this.translate.instant("error.credentialOffer.invalid-url");
      this.dialog.openErrorInfoDialog(DialogComponent, message);
    }
    return params;
  }

  public getCredentialOfferByTransactionCode(transactionCode:string): Observable<CredentialOfferResponse> {
    if(!transactionCode){
      console.error("No transaction code was found, can't refresh QR.");
      const message = this.translate.instant("error.credentialOffer.invalid-url");
      this.dialog.openErrorInfoDialog(DialogComponent, message);
      this.redirectToHome();
      return throwError(()=>new Error());
    }

    return this.credentialProcedureService.getCredentialOfferByTransactionCode(transactionCode)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
    )
  }

  public getCredentialOfferByCTransactionCode(cCode:string): Observable<CredentialOfferResponse> {
    if (!cCode) {
      console.error("No c-transaction code was found, can't refresh QR.");
      const message = this.translate.instant("error.credentialOffer.invalid-url");
      this.dialog.openErrorInfoDialog(DialogComponent, message);
      this.redirectToHome();
      return throwError(()=>new Error());
    }

    return this.credentialProcedureService.getCredentialOfferByCTransactionCode(cCode)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
  }

  public updateUrlParams(offerParams:CredentialOfferParams): void{
      const cCode = offerParams.c_transaction_code;
      const cCodeParam = cCode ? {c:cCode} : undefined;
        if(cCodeParam){
          this.router.navigate(
            [], {
              queryParams: cCodeParam,
              queryParamsHandling: 'merge'
            }
          );
      }
  }

  public onRefreshCredentialClick(): void{
    this.loadCredentialOfferOnRefreshClick$$.next();
  }

  public redirectToHomeAndShowErrorDialog(errMessage: string): void{
    this.redirectToHome();
    this.dialog.openErrorInfoDialog(DialogComponent, this.translate.instant(errMessage));
  }

  public redirectToHome(): void{
    setTimeout(()=>{
      this.router.navigate(['/home']);
    }, 0);
  }

}