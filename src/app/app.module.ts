
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutes } from './app.routing';
import { AppComponent } from './app.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { FullComponent, BuscarDialogContent } from './layouts/full/full.component';
import { AppBlankComponent } from './layouts/blank/blank.component';

import { VerticalAppHeaderComponent } from './layouts/full/vertical-header/vertical-header.component';
import { VerticalAppSidebarComponent } from './layouts/full/vertical-sidebar/vertical-sidebar.component';
import { HorizontalAppHeaderComponent } from './layouts/full/horizontal-header/horizontal-header.component';
import { HorizontalAppSidebarComponent } from './layouts/full/horizontal-sidebar/horizontal-sidebar.component';

import { AppBreadcrumbComponent } from './layouts/full/breadcrumb/breadcrumb.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoMaterialModule } from './demo-material-module';

import { SharedModule } from './shared/shared.module';
import { SpinnerComponent } from './shared/spinner.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { LoaderComponent  } from "./Genericos/loader/loader.component";
import { LoaderService  } from "./auth/services/loader.service";
import { LoaderInterceptor  } from "./interceptors/loader.interceptor";

import { RequestInterceptor } from './auth/request.interceptor';

//import { VisorPdfComponent } from "./Genericos/Visor-pdf/Visor-pdf.component";


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelSpeed: 2,
  wheelPropagation: true
};

@NgModule({
  declarations: [								
    AppComponent,
    FullComponent,
    VerticalAppHeaderComponent,
    SpinnerComponent,
    AppBlankComponent,
    VerticalAppSidebarComponent,
    AppBreadcrumbComponent,
    HorizontalAppHeaderComponent,
    HorizontalAppSidebarComponent,
    BuscarDialogContent,    
    //VisorPdfComponent,
   ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DemoMaterialModule,
    FormsModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    HttpClientModule,
    SharedModule,
    RouterModule.forRoot(AppRoutes),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    },
    LoaderService,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents:[BuscarDialogContent,
    //VisorPdfComponent,
  ],
    
  bootstrap: [AppComponent]
})
export class AppModule { }
