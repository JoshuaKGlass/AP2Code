import {Component, OnInit} from '@angular/core';
import {WebService} from "../web.service";
import {FormBuilder, Validators} from "@angular/forms";
import {HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  registerForm: any;
  private username: string = '';
  private email: string = '';
  private password: string = '';


  constructor(public webService: WebService,
              private formBuilder: FormBuilder) {
  }


  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }


  isUntouched() {
    return this.registerForm.controls.username.pristine &&
      this.registerForm.controls.password.pristine;
  }

  isIncomplete() {
    return this.isInvalid('username') ||
      this.isInvalid('email') ||
      this.isInvalid('password') ||
      this.isUntouched();
  }

  isNotAdmin() {
    //console.log((<HTMLInputElement>document.getElementById("username")).value);
    return ((<HTMLInputElement>document.getElementById("username")).value == 'admin' || (<HTMLInputElement>document.getElementById("username")).value == 'Admin');

  }

  isInvalid(control: any) {
    return this.registerForm.controls[control].invalid &&
      this.registerForm.controls[control].touched;
  }


  tokenHeader() {
    return {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(this.username + ':' + this.password)
      })
    }
  }


  onSubmit() {
    this.webService.addNewUser(this.registerForm.value);
  }

}
