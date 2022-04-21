import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {MaincontentComponent} from "./maincontent/maincontent.component";
import {UserprofileComponent} from "./userprofile/userprofile.component";
import {QuizComponent} from "./quiz/quiz.component";


// routes go here
const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'signin',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'maincontent',
    component: MaincontentComponent
  },
  {
    path: 'profile',
    component: UserprofileComponent
  },
    {
    path: 'quiz',
    component: QuizComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
