import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {AppComponent} from './app.component';
import {EmailsApiService} from './emails/emails-api.service';
import {ReactiveFormsModule} from '@angular/forms';
import {AppRoutingModule} from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
	ReactiveFormsModule,
	AppRoutingModule
  ],
  providers: [EmailsApiService],
  bootstrap: [AppComponent]
})
export class AppModule {
}