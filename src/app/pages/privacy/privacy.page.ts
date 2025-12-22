import { Component, OnInit } from "@angular/core";
import { MenuController } from "@ionic/angular";
import { Router } from "@angular/router";

@Component({
  selector: "app-privacy",
  templateUrl: "./privacy.page.html",
  styleUrls: ["./privacy.page.scss"],
  standalone: false,
})
export class PrivacyPage implements OnInit {
  constructor(
    private router: Router,
    private menuCtrl: MenuController,
  ) {}

  openMenu() {
    this.menuCtrl.open("main-menu");
  }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(["/"]);
  }
}
