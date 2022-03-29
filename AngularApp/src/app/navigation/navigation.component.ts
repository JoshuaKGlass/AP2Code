import { Component, OnInit } from '@angular/core';
import {WebService} from "../web.service";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  constructor(public webService: WebService) { }

  ngOnInit(): void {
  }
}
