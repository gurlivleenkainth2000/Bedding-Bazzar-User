import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  errorMsg: string;

  public loader: boolean = false;
  public googleLoader: boolean = false;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(12)]]
    });
  }

  loginUser(form: FormGroup) {
    this.loader = true;
    if (form.invalid) {
      this.loader = false;
      return;
    }

    this.authService.loginUser({ ...form.value })
      .then((value) => {
        console.log(">>> Value", value);
        
        this.loader = false;
      }).catch((err) => {
        // console.log(err);
        this.loader = false;
        if (err.code === 'auth/user-not-found') {
          this.errorMsg = 'user does not exist, please check email !';
        } else if (err.code === 'auth/user-disabled') {
          this.errorMsg = 'user is disabled, please contact admin !';
        } else if (err.code === 'auth/wrong-password') {
          this.errorMsg = 'Incorrect password !!!';
        } else {
          this.errorMsg = 'Error Occurred, please try again !';
        }
      });
  }

}
