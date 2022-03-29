import {Component, OnInit} from '@angular/core';
import {WebService} from "../web.service";
import {FormBuilder, Validators} from "@angular/forms";
import {HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  loginForm: any;
  private username: string = '';
  private password: string = '';

  constructor(public webService: WebService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }


  isUntouched() {
    return this.loginForm.controls.username.pristine &&
      this.loginForm.controls.password.pristine;
  }

  isIncomplete() {
    return this.isInvalid('username') ||
      this.isInvalid('password') ||
      this.isUntouched();
  }

  isInvalid(control: any) {
    return this.loginForm.controls[control].invalid &&
      this.loginForm.controls[control].touched;
  }

  tokenHeader() {
    return {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(this.username + ':' + this.password)
      })
    }
  }


  onSubmit() {
    this.username = (<HTMLInputElement>document.getElementById("username")).value;
    this.password = (<HTMLInputElement>document.getElementById("password")).value;
    this.webService.setUserName(this.username)
    this.webService.getLogin(this.tokenHeader());
  }
}
