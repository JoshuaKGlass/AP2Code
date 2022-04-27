import { Component, OnInit } from '@angular/core';
import {WebService} from "../web.service";

@Component({
  selector: 'app-maincontent',
  templateUrl: './maincontent.component.html',
  styleUrls: ['./maincontent.component.css']
})
export class MaincontentComponent implements OnInit {

  constructor(public webService: WebService) { }

  ngOnInit(): void {

  }


}
