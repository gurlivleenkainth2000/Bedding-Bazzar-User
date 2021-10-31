import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserModel } from '../models/user-model';
import { CUSTOMERS_COLLECTION, MONTHLY_CUSTOMERS_COLLECTION } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  today: Date = new Date();
  datepipe: DatePipe = new DatePipe('en');

  user$: Observable<firebase.auth.IdTokenResult | null>;
  userSub = new BehaviorSubject<UserModel>(null);

  constructor(
    private dbRef: AngularFirestore,
    private authRef: AngularFireAuth,
    private router: Router
  ) {    

    this.authRef.authState.pipe(
      switchMap((res) => {
        if(res) {
          this.getUserFromFirestore(res.uid);
          return this.authRef.idTokenResult;
        } else {
          return of(null);
        }
      })
    ).subscribe();
  }

  get currentUserObservable(): any {
    return this.authRef.authState;
  }

  loginUser(values: { email: string, password: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authRef.signInWithEmailAndPassword(values.email.trim(), values.password)
        .then((res) => {
          this.user$ = this.authRef.idTokenResult;
          this.router.navigate(['/'], { replaceUrl: true });
          this.getUserFromFirestore(res.user.uid);
          resolve(res)
        }, (error) => reject(error));
    });
  }

  googleLogin(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authRef.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then((res) => {
          if (res.additionalUserInfo.isNewUser) {
            // If New User Registered
            let userModel: UserModel = {
              userId: this.dbRef.createId(),
              authId: res.user.uid,
              firstName: res.additionalUserInfo.profile['given_name'] || null,
              lastName: res.additionalUserInfo.profile['family_name'] || null,
              mobile: res.user.phoneNumber || null,
              email: res.user.email,
              imageUrl: res.user.photoURL || null,
              userMonthlyId: this.datepipe.transform(this.today, 'yyyyMM'),
              providerId: res.additionalUserInfo.providerId || null,
              active: true,
              gender: 2,
              createdOn: firebase.firestore.Timestamp.now()
            };
            this.saveUserToFirestore(userModel);
          }

          this.user$ = from(res.user.getIdTokenResult());
          this.router.navigate(['/'], { replaceUrl: true });
          this.getUserFromFirestore(res.user.uid);
          resolve(res);
        }, (error) => {
          reject(error);
        });
    });
  }

  registerUserToAuthentication(values: { firstName: string; lastName: string, email: string, password: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authRef.createUserWithEmailAndPassword(values.email, values.password)
        .then((res) => {
          let userModel: UserModel = {
            userId: this.dbRef.createId(),
            authId: res.user.uid,
            firstName: values.firstName,
            lastName: values.lastName,
            mobile: null,
            email: values.email,
            imageUrl: null,
            userMonthlyId: this.datepipe.transform(this.today, 'yyyyMM'),
            providerId: res.additionalUserInfo.providerId,
            active: true,
            gender: 2,
            createdOn: firebase.firestore.Timestamp.now()
          };

          this.user$ = from(res.user.getIdTokenResult());
          // this.router.navigate(['/'], { replaceUrl: true });
          this.saveUserToFirestore(userModel);
          this.getUserFromFirestore(res.user.uid);

          resolve({ authRes: res, userModel: userModel });
        }, (err) => reject(err.message));
    });
  }

  saveUserToFirestore(userMobel: UserModel) {
    return new Promise((resolve, reject) => {
      this.dbRef.collection(MONTHLY_CUSTOMERS_COLLECTION).doc(userMobel.userMonthlyId)
        .collection(CUSTOMERS_COLLECTION).doc(userMobel.userId)
        .set({ ...userMobel }, { merge: true })
        .then((value) => resolve(value), (error) => reject(error.message));
    });
  }

  getUserFromFirestore(authId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dbRef.firestore.collectionGroup(CUSTOMERS_COLLECTION)
        .where('authId', '==', authId)
        .get()
        .then((res) => {
          if (res.size !== 0) {
            this.userSub.next(Object.assign({}, res.docs[0].data() as UserModel));
          }
          resolve(res);
        }, (error) => reject(error));
    });
  }

  logout() {
    this.authRef.signOut().then((value) => {
      this.userSub.next(null);
      delete this.user$;
    })
  }
}

