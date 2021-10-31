import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  errorMsg: string;

  loader: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(12)]]
    })
  }

  registerUser(form: FormGroup) {
    this.loader = true;
    if (form.invalid) {
      this.loader = false;
      return;
    }

    this.authService.registerUserToAuthentication({ ...form.value })
      .then((value) => {
        console.log(">>> Value", value);
        this.loader = false;
      }).catch((err) => {
        // console.log(err);
        this.loader = false;
        this.errorMsg = err;
      });
  }

}
