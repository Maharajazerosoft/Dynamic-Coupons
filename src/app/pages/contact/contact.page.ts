import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonProvider } from '../../providers/common/common';

// Note: @ionic-native/date-picker and @ionic-native/paypal removed as they are Cordova-specific
// You'll need to find Capacitor alternatives for these if needed

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: false
})
export class ContactPage {
  element: any = { email: '', name: '', subject: '', message: '', captcha: '' };
  value: any;
  price_id: any;
  sitekey: string = "6LfaJeMnAAAAAGx3s8ylmWMk9Qd0aUiqYiGF1sPX";
  captchaNumber: number = 0;
  captchaInput: string = '';
  isCaptchaInvalid: boolean = false;
  formattedCaptcha: string = '';
  
  @Input() size: string = '';
  @Input() hl: string = '';
  @Input() theme: string = '';
  @Input() type: string = '';

  captchaResponse: any;

  constructor(
    private router: Router,
    public _commonService: CommonProvider
  ) {
    this.generateCaptcha();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }

  generateCaptcha() {
    this.captchaNumber = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit random number
    this.formattedCaptcha = this.captchaNumber.toString().split('').join(' '); // Add spacing for style
  }
  
  handleCaptchaResolved(event: string): void {
    this.captchaResponse = event;
    console.log('reCAPTCHA resolved:', event);
    console.log('reCAPTCHA resolved:', this.captchaResponse);
  }

  refreshCaptcha() {
    this.generateCaptcha();
    this.captchaInput = '';  // Clear the input field
    this.isCaptchaInvalid = false;
  }

  goBack() {
    this.router.navigate(['/']); // Adjust the route as needed
  }

  loginPage() {
    this.router.navigate(['/login']);
  }

  registerForm(formdata: any) {
    console.log(this.captchaInput, "captchaInput");
    console.log(this.captchaNumber, "captchaNumber");
    console.log('Form submitted with reCAPTCHA response:', this.captchaResponse);
    console.log(formdata);
    
    var fullname = formdata.name;
    var email = formdata.email;
    var subject = formdata.subject;
    var message = formdata.message;
    var captcha = formdata.captcha;

    console.log(captcha, "captcha");
    
    var data;
    var web_package = this.price_id;
    
    if (formdata === undefined || formdata === '') {
      this._commonService.presentToast(`Field are required.`);
    } else if (email === undefined || email === '') {
      this._commonService.presentToast(`Enter your email.`);
    } else if (!this._commonService.validateEmail(email)) {
      this._commonService.presentToast(`Enter valid email.`);
    } else if (fullname === undefined || fullname === '' || fullname.trim() === '') {
      this._commonService.presentToast(`Enter your name.`);
    } else if (subject === undefined || subject === '' || subject.trim() === '') {
      this._commonService.presentToast(`Enter Subject.`);
    } else if (message === undefined || message === '' || message.trim() === '') {
      this._commonService.presentToast(`Enter Message.`);
    } else if (this.captchaInput == "") {
      this._commonService.presentToast(`Enter the captcha.`);
    } else if (parseInt(this.captchaInput) !== this.captchaNumber) {
      this._commonService.presentToast(`Invalid CAPTCHA, please try again.`);
    } else {
      console.log(this.value, 'this.value');
     
      data = {
        name: fullname,
        email: email,
        subject: subject,
        message: message.replace(/\n/g, '<br>'),
        date: new Date(),
      };
      
      this._commonService.presentLoading();
      this._commonService.contactform(data).then(Response => {
        if (Response.status === '200') {
          console.log(this.value, 'this.value');
          this._commonService.closeLoading();
          this.router.navigate(['/search']);
          this._commonService.presentToast(Response.error);
        } else {
          this._commonService.closeLoading();
          this._commonService.presentToast(Response.error);
        }
      }, (err) => {
        this._commonService.closeLoading();
        this._commonService.presentToast(`Connection error`);
      });
      
      this.element = { email: '', name: '', subject: '', message: '' };
    }
  }
}