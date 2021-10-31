import firebase from "firebase/app";

export class UserModel {
  userId: string;
  authId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  imageUrl: any;
  userMonthlyId: string;
  providerId: any;
  gender: number; // 0 -> Male | 1 -> Female | 2 -> Not Provided
  active: boolean;
  createdOn: firebase.firestore.Timestamp;
}
