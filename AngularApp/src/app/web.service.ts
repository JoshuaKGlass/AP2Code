import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";

@Injectable()
export class WebService {
  //headers and session storage for admin purposes
  private admin: boolean = sessionStorage['admin'];
  private currentUser: string = '';

  //init headers
  private headers = new HttpHeaders()
    .set('x-access-token', "")
    .set('userID', "")
    .set('content-type', 'application/json');

  constructor(public http: HttpClient, private router: Router) {
  }

  //todo:
  // implement bokeh
  // quiz area
  // search area

  //add new user profile
  addNewUser(newUser: any) {
    let newUserData = new FormData();
    newUserData.append("username", newUser.username);
    newUserData.append("email", newUser.email);
    newUserData.append("password", newUser.password);

    this.http.post('http://localhost:5000/api/v1/users/register', newUserData).subscribe(response => {
      //console.log(response);
      return this.router.navigate(['/signin'])
    });
  }

  //delete user profile
  deleteProfile(id: any) {
    this.http.delete('http://127.0.0.1:5000/api/v1/users/' + id).subscribe(res => {
      console.log(res);
      sessionStorage.clear();
      this.headers.delete('x-access-token');
      this.headers.delete('userID');
      return this.router.navigate(['/register'])
    });
  }

  //https://www.sohamkamani.com/blog/javascript-localstorage-with-ttl-expiry/
  //login func, set headers. redirects to home
  async getLogin(headerOptions: { headers: HttpHeaders }) {
    this.http.get('http://localhost:5000/api/v1/login', headerOptions).subscribe(res => {
      console.log(res);

      //parse json response
      let json = JSON.stringify(res);
      const obj = JSON.parse(json);

      //set user session storage to be used by headers
      sessionStorage['userID'] = obj.userID;
      sessionStorage['token'] = obj.token;
      console.log(obj.admin)
      sessionStorage['admin'] = obj.admin;
      this.admin = obj.admin;

      //setting http headers here
      this.headers = this.headers.set('x-access-token', obj.token);
      this.headers = this.headers.set('userID', obj.userID);
      // console.log(this.headers)

      return this.router.navigate(['/home']);
    });
  }

  //get user profile
  getSingleUser(headerOptions: { headers: HttpHeaders }) {
    return this.http.get("http://localhost:5000/api/v1/users/" + sessionStorage['userID'], headerOptions);
  }

  //edit user password
  editUserPass(password: any, headerOptions: { headers: HttpHeaders }) {
    let newUserPass = new FormData();
    newUserPass.append("password", password.password);

    this.http.put("http://localhost:5000/api/v1/users/" + sessionStorage['userID'], newUserPass, headerOptions).subscribe(res => {
      console.log(res)
    })
  }

  //set username header
  setUserName(name: string) {
    this.currentUser = name
  }

  //get username
  getUserName() {
    return this.currentUser
  }

  //checks if user is logged in, returns session token, either null or set by login func
  isLoggedIn() {
    let h = sessionStorage['token']
    if (h == null) {
      //console.log('content type header not present')
      return h;
    } else {
      //console.log(h) //returns 'application/json'
      return h;
    }
  }

  //get userID header
  getUserIDHeader() {
    return this.headers.get('userID');
  }

  //get user token from header
  getToken() {
    return this.headers.get('x-access-token');
  }

  //check if user has admin privileges
  isAdmin(): boolean {
    //console.log(this.admin)
    return this.admin
  }

  //logout of application, clears session storage and http headers
  logOut() {
    this.http.get('http://localhost:5000/api/v1/logout', {headers: this.headers}).subscribe(res => {
      console.log(res);
    });

    //clear the header and session storage
    this.headers.delete('x-access-token');
    this.headers.delete('userID');
    sessionStorage.clear();
    return this.router.navigate(['/home']);
  }

}
