import {
  InjectionToken,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  initializeApp,
  FirebaseOptions,
} from 'firebase/app';
import {
  getFirestore,
  Firestore,
} from 'firebase/firestore';

// export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIRESTORE = new InjectionToken<Firestore>(
  'FIRESTORE'
);

@NgModule({
  imports: [CommonModule],
})
export class NgFirestoreModule {
  static initialize(
    firebaseOptions: FirebaseOptions
  ): ModuleWithProviders<NgFirestoreModule> {
    return {
      ngModule: NgFirestoreModule,
      providers: [
        {
          provide: FIRESTORE,
          useValue: getFirestore(
            initializeApp(firebaseOptions)
          ),
        },
      ],
    };
  }
}
