import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgFirestoreModule } from 'ng-firestore';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AppComponent],
  imports: [
    RouterModule.forRoot([]),
    BrowserModule,
    ReactiveFormsModule,
    NgFirestoreModule.initialize({
      apiKey: 'AIzaSyDKJ8d060It_sNnASB6eSk3OhL2NSAjAxQ',
      authDomain: 'ng-firestore-demo-app.firebaseapp.com',
      projectId: 'ng-firestore-demo-app',
      storageBucket: 'ng-firestore-demo-app.appspot.com',
      messagingSenderId: '286992976398',
      appId: '1:286992976398:web:6af886e190a3a1e6114a5f',
      measurementId: 'G-7L7LP294R8',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
