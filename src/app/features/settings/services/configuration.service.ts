import { Injectable, inject } from '@angular/core';
import {SignatureConfigPayload} from '../models/configuration.models';
import { ConfigurationRepository } from './configuration.repository';
import {  map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private readonly repository= inject(ConfigurationRepository);

  saveConfiguration(enableRemoteSignature: boolean, signatureMode: string): Observable<void> {
    const payload: SignatureConfigPayload = {
      enableRemoteSignature,
      signatureMode
    };
    return this.repository.saveConfig(payload);
  }

  getConfiguration(): Observable<SignatureConfigPayload | null> {
    return this.repository.getConfig().pipe(
      map((config: any) => {
        return config?.enableRemoteSignature !== undefined && config?.signatureMode !== undefined
          ? config as SignatureConfigPayload
          : null;
      })
    );
  }

  updateConfiguration(config: Partial<SignatureConfigPayload>): Observable<void> {
    return this.repository.updateConfiguration(config);
  }


}
