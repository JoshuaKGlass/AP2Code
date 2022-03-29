import {Component, OnInit} from '@angular/core';
import {WebService} from "../web.service";
import {HttpHeaders} from "@angular/common/http";
import {FormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.css']
})
export class UserprofileComponent implements OnInit {
  userProfile: any = [];
  editUserForm: any;
  btnEditUser: boolean = false;

  constructor(public webService: WebService, private formBuilder: FormBuilder) {
  }

  //get access token from signing in
  tokenHeader() {
    return {
      headers: new HttpHeaders({
        'x-access-token': sessionStorage['token']
      })
    }
  }

  //on init get user profile using access token from tokenHeader()
  ngOnInit(): void {
    this.editUserForm = this.formBuilder.group({
      password: ['', Validators.required],
      reEnterPassword: ['']
    });

    this.userProfile = this.webService.getSingleUser(this.tokenHeader())
    this.btnEditUser = false;
  }

  isUntouched() {
    return this.editUserForm.controls.password.pristine;
  }

  isInvalid(control: any) {
    return this.editUserForm.controls[control].invalid &&
      this.editUserForm.controls[control].touched;
  }

  isIncomplete() {
    return this.isInvalid('password') ||
      this.isUntouched();
  }

  deleteUser() {
    this.webService.deleteProfile(sessionStorage['userID']);
  }

  //validate new pass
  passwordMatch() {
    //console.log((<HTMLInputElement>document.getElementById("password")).value)
    //console.log((<HTMLInputElement>document.getElementById("reEnterPassword")).value)
    return ((<HTMLInputElement>document.getElementById("password")).value === (<HTMLInputElement>document.getElementById("reEnterPassword")).value)
  }


  onSubmit() {
    //console.log(this.editUserForm)
    this.webService.editUserPass(this.editUserForm.value, this.tokenHeader());
    this.btnEditUser = false;
    alert("Password Updated")
  }

  btnEditUserClicked() {
    return this.btnEditUser = !this.btnEditUser;
  }

}
