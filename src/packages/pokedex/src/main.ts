/// <reference types="@angular/localize" /> 

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { LOCALE_ID, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { ROUTES } from "./app/router";
import { provideHttpClient, withFetch } from "@angular/common/http";

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withFetch()),
    provideRouter(ROUTES),
    { provide: LOCALE_ID, useValue: "en-US" }
  ]
}).catch((err) => console.error(err));
