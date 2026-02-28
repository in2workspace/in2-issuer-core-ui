import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {SignatureConfigPayload} from '../models/configuration.models'
import {API_PATH} from 'src/app/core/constants/api-paths.constants';
import { environment } from 'src/environments/environment';
@Injectable({ providedIn: 'root' })
export class ConfigurationRepository {
  private readonly http = inject(HttpClient);
  private readonly configurationUrl = environment.server_url+API_PATH.CONFIGURATION;

  saveConfig(payload: SignatureConfigPayload): Observable<void> {
    return this.http.post<void>(this.configurationUrl, payload);
  }

  getConfig(): Observable<SignatureConfigPayload> {
    return this.http.get<SignatureConfigPayload>(this.configurationUrl);
  }

  updateConfiguration(payload: Partial<SignatureConfigPayload>): Observable<void> {
    return this.http.patch<void>(this.configurationUrl, payload);
  }


}
