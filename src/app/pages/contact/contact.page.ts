import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { CommonService } from "../../../providers/common/common.service";
import { MenuController, NavController } from "@ionic/angular";

@Component({
  selector: "app-contact",
  templateUrl: "./contact.page.html",
  styleUrls: ["./contact.page.scss"],
  standalone: false,
})
export class ContactPage {
  element: any = { email: "", name: "", subject: "", message: "", captcha: "" };
  value: any;
  price_id: any;
  sitekey: string = "6LfaJeMnAAAAAGx3s8ylmWMk9Qd0aUiqYiGF1sPX";
  captchaNumber: number = 0;
  captchaInput: string = "";
  isCaptchaInvalid: boolean = false;
  formattedCaptcha: string = "";

  @Input()
  size: string = "";
  @Input()
  hl: string = "";
  @Input()
  theme: string = "";
  @Input()
  type: string = "";

  captchaResponse: any;

  constructor(
    private router: Router,
    public _commonService: CommonService,
    private menuCtrl: MenuController,
    private navController: NavController
  ) {
    this.generateCaptcha();
  }

  openMenu() {
    this.menuCtrl.open("main-menu");
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SignupPage");
  }

  generateCaptcha() {
    this.captchaNumber = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit random number
    this.formattedCaptcha = this.captchaNumber.toString().split("").join(" "); // Add spacing for style
  }

  handleCaptchaResolved(event: string): void {
    this.captchaResponse = event;
    console.log("reCAPTCHA resolved:", event);
    console.log("reCAPTCHA resolved:", this.captchaResponse);
  }

  refreshCaptcha() {
    this.generateCaptcha();
    this.captchaInput = ""; // Clear the input field
    this.isCaptchaInvalid = false;
  }

  goBack() {
    this.router.navigate(["/"]); // Adjust the route as needed
  }

  loginPage() {
    this.router.navigate(["/login"]);
  }

  registerForm(formdata: any) {
    console.log("Form data:", formdata);
    console.log("CAPTCHA Input:", this.captchaInput);
    console.log("CAPTCHA Number:", this.captchaNumber);
    console.log("Form submitted with reCAPTCHA response:", this.captchaResponse);

    // Use the element object which is bound to the form
    const fullname = this.element.name;
    const email = this.element.email;
    const subject = this.element.subject;
    const message = this.element.message;

    console.log("Captcha from element:", this.element.captcha);
    console.log("Captcha from separate variable:", this.captchaInput);

    var data;
    var web_package = this.price_id;

    if (!email || email.trim() === "") {
      this._commonService.presentToast(`Enter your email.`);
      return;
    } else if (!this._commonService.validateEmail(email)) {
      this._commonService.presentToast(`Enter valid email.`);
      return;
    } else if (!fullname || fullname.trim() === "") {
      this._commonService.presentToast(`Enter your name.`);
      return;
    } else if (!subject || subject.trim() === "") {
      this._commonService.presentToast(`Enter Subject.`);
      return;
    } else if (!message || message.trim() === "") {
      this._commonService.presentToast(`Enter Message.`);
      return;
    } else if (!this.captchaInput || this.captchaInput.trim() === "") {
      this._commonService.presentToast(`Enter the captcha.`);
      return;
    } else if (parseInt(this.captchaInput) !== this.captchaNumber) {
      this._commonService.presentToast(`Invalid CAPTCHA, please try again.`);
      this.isCaptchaInvalid = true;
      return;
    }

    console.log(this.value, "this.value");

    data = {
      name: fullname,
      email: email,
      subject: subject,
      message: message.replace(/\n/g, "<br>"),
      date: new Date(),
    };

    this._commonService.presentLoading();
    this._commonService.contactform(data).then(Response => {
      if (Response.status === "200") {
        console.log(this.value, "this.value");
        this._commonService.closeLoading();
        this.router.navigate(["/search"]);
        this._commonService.presentToast(Response.error);
      } else {
        this._commonService.closeLoading();
        this._commonService.presentToast(Response.error);
      }
    }, (err) => {
      this._commonService.closeLoading();
      this._commonService.presentToast(`Connection error`);
    });

    // Clear form
    this.element = { email: "", name: "", subject: "", message: "", captcha: "" };
    this.captchaInput = "";
    this.generateCaptcha(); // Generate new CAPTCHA after submission
  }
  goBackArrow() {
    this.navController.back();
  }
  
}
