import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, ToastController, Platform } from '@ionic/angular';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  loading: any;
  profile: any;
  uri = environment.apiBaseUrl;

  constructor(
    public http: HttpClient,
    public loadingController: LoadingController,
    public toastController: ToastController,
    public platform: Platform
  ) {
    console.log('CommonService initialized');
  }

  async presentLoading() {
    try {
      this.loading = await this.loadingController.create({
        message: 'Loading...',
        spinner: 'crescent'
      });
      await this.loading.present();
    } catch (error) {
      console.error('Error showing loading:', error);
    }
  }

  async closeLoading() {
    try {
      if (this.loading) {
        await this.loading.dismiss();
        this.loading = null;
      }
    } catch (e) {
      console.warn('Loader already dismissed or not found');
    }
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: `${msg}`,
      duration: 3000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }

  async presentLongToast(msg: string) {
    const toast = await this.toastController.create({
      message: `${msg}`,
      duration: 15000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }

  validateEmail(email: string): boolean {
    const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  }

  validateUrls(url: string): boolean {
    const re = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return re.test(url);
  }

  changedate(conDate: Date): string {
    let dd: any = conDate.getDate();
    let MM: any = conDate.getMonth() + 1;
    const yy: any = conDate.getFullYear();
    
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (MM < 10) {
      MM = '0' + MM;
    }
    
    return `${MM}/${dd}/${yy}`;
  }

  getTimeStamp(forceDate = false): any {
    const date = new Date(new Date().getTime() + (24 * 3600 * 1000));
    return (this.platform.is('android') && !forceDate) ? date.getTime() : date;
  }

  // HTTP Methods with modern Angular syntax
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
  }

  /**
   * Forgot Password
   */
  async forgotPassword(params: any): Promise<any> {
    const url = `${this.uri}/forgetpassword`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Forgot Password Publisher
   */
  async forgotPasswordPublisher(params: any): Promise<any> {
    const url = `${this.uri}/forgetpasswordpub`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Forgot Password Advertiser
   */
  async forgotPasswordAdvertiser(params: any): Promise<any> {
    const url = `${this.uri}/forgetpasswordad`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Login User
   */
  async loginform(params: any): Promise<any> {
    const url = `${this.uri}/userlogin`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Get User Profile
   */
  async getprofile(): Promise<any> {
    await this.presentLoading();
    const userid = localStorage.getItem('DCloginID');
    const url = `${this.uri}/getprofile/?type=user&userid=${userid}`;
    
    try {
      const response = await lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
      await this.closeLoading();
      return response;
    } catch (error) {
      await this.closeLoading();
      throw error;
    }
  }

  /**
   * Register User
   */
  async registerform(params: any): Promise<any> {
    const url = `${this.uri}/registeruser`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Register Publisher
   */
  async registerPublisher(params: any): Promise<any> {
    const url = `${this.uri}/registerpublisher`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Update User Profile
   */
  async profileupdate(params: any): Promise<any> {
    const url = `${this.uri}/profileupdate`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Update User Password
   */
  async passwordchange(params: any): Promise<any> {
    const url = `${this.uri}/passwrodupdate`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Get Search Results
   */
  async getsearch(key: string): Promise<any> {
    await this.presentLoading();
    const encodedKey = encodeURIComponent(key);
    const url = `${this.uri}/getsearch/?search_form=${encodedKey}`;
    
    try {
      const response = await lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
      await this.closeLoading();
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Alternative search method
   */
  async getsearch1(key: string): Promise<any> {
    const encodedKey = encodeURIComponent(key);
    const url = `${this.uri}/getsearch/?search_form=${encodedKey}`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  /**
   * Generate random ID
   */
  makeid(length: number): string {
    let result = '';
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * Get Coupons List (Local or National)
   */
  async getCouponsList(routeType: string): Promise<any> {
    const url = `${this.uri}/getoffer/?type=${routeType}`;
    
    try {
      const response = await lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
      setTimeout(async () => {
        await this.closeLoading();
      }, 500);
      return response;
    } catch (error) {
      setTimeout(async () => {
        await this.closeLoading();
      }, 500);
      throw error;
    }
  }

  /**
   * Get Coupons List (without loading)
   */
  async getCouponsList1(routeType: string): Promise<any> {
    const url = `${this.uri}/getoffer/?type=${routeType}`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  /**
   * Get Pricing Lists
   */
  async getContentlist(routeType: string): Promise<any> {
    await this.presentLoading();
    const url = `${this.uri}/getpricinguserid/?userid=${routeType}`;
    
    try {
      const response = await lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
      setTimeout(async () => {
        await this.closeLoading();
      }, 500);
      return response;
    } catch (error) {
      setTimeout(async () => {
        await this.closeLoading();
      }, 500);
      throw error;
    }
  }

  /**
   * Get DC Blog
   */
  async getemployeeContent(): Promise<any> {
    await this.presentLoading();
    const url = `${this.uri}/getdcblog/`;
    
    try {
      const response = await lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
      setTimeout(async () => {
        await this.closeLoading();
      }, 500);
      return response;
    } catch (error) {
      setTimeout(async () => {
        await this.closeLoading();
      }, 500);
      throw error;
    }
  }

  /**
   * Send Contact Form
   */
  async contactform(params: any): Promise<any> {
    const url = `${this.uri}/contactuser`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Get Contents
   */
  async getEmployeeList(routeType: string): Promise<any> {
    if (routeType !== 'contact') {
      await this.presentLoading();
      const url = `${this.uri}/getcontent/?type=${routeType}`;
      
      try {
        const response = await lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
        setTimeout(async () => {
          await this.closeLoading();
        }, 500);
        return response;
      } catch (error) {
        setTimeout(async () => {
          await this.closeLoading();
        }, 500);
        throw error;
      }
    }
  }

  /**
   * Get Subscription History
   */
  async getsubscribeHistory(): Promise<any> {
    await this.presentLoading();
    const userid = localStorage.getItem('DCloginID');
    const url = `${this.uri}/getsubscribeHistory/?type=user&userid=${userid}`;
    
    try {
      const response = await lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
      setTimeout(async () => {
        await this.closeLoading();
      }, 500);
      return response;
    } catch (error) {
      setTimeout(async () => {
        await this.closeLoading();
      }, 500);
      throw error;
    }
  }

  /**
   * Get Social Link
   */
  async sociallink(id: string): Promise<any> {
    const url = `${this.uri}/sociallink/?web_id=${id}`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  /**
   * Pricing
   */
  async pricing(params: any): Promise<any> {
    const url = `${this.uri}/Pricing`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Signup Listing
   */
  async siginregister(): Promise<any> {
    const userid = localStorage.getItem('DCloginID');
    const url = `${this.uri}/signuplisting/?web_id=${userid}`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  /**
   * Referral User
   */
  async referraluser(): Promise<any> {
    await this.presentLoading();
    const userid = localStorage.getItem('DCpubloginID');
    const url = `${this.uri}/referraluser/?web_id=${userid}`;
    
    try {
      const response = await lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
      await this.closeLoading();
      return response;
    } catch (error) {
      await this.closeLoading();
      throw error;
    }
  }

  /**
   * Ad User
   */
  async aduser(params: any): Promise<any> {
    await this.presentLoading();
    const url = `${this.uri}/aduser_data/`;
    
    try {
      const response = await lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
      await this.closeLoading();
      return response;
    } catch (error) {
      await this.closeLoading();
      throw error;
    }
  }

  /**
   * Publisher Login
   */
  async publisherloginform(params: any): Promise<any> {
    const url = `${this.uri}/publisherlogin`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Advertiser Login
   */
  async advertiseloginform(params: any): Promise<any> {
    const url = `${this.uri}/advertiserlogin`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Publisher Button Code
   */
  async publisherButtoncode(): Promise<any> {
    await this.presentLoading();
    const userid = localStorage.getItem('DCpubloginID');
    const url = `${this.uri}/getbuttoncode/?web_id=${userid}`;
    
    try {
      const response = await lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
      await this.closeLoading();
      return response;
    } catch (error) {
      await this.closeLoading();
      throw error;
    }
  }

  /**
   * Retrieve Ad Price
   */
  async retrivePubAdPrice(params: any): Promise<any> {
    const url = `${this.uri}/retriveAdPrice`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Change Ad Publisher
   */
  async changeAdPublisher(params: any): Promise<any> {
    const url = `${this.uri}/changeadprice`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Send Withdraw Request
   */
  async sendWithdrawRequest(params: any): Promise<any> {
    await this.presentLoading();
    const url = `${this.uri}/sendwithdrawreq`;
    
    try {
      const response = await lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
      await this.closeLoading();
      return response;
    } catch (error) {
      await this.closeLoading();
      throw error;
    }
  }

  /**
   * Redeemed Users
   */
  async redeemedusers(params: any): Promise<any> {
    await this.presentLoading();
    const url = `${this.uri}/redeemedadvertisers`;
    
    try {
      const response = await lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
      await this.closeLoading();
      return response;
    } catch (error) {
      await this.closeLoading();
      throw error;
    }
  }

  /**
   * View Advertiser
   */
  async viewaduser(params: any): Promise<any> {
    await this.presentLoading();
    const url = `${this.uri}/viewadvertiser`;
    
    try {
      const response = await lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
      await this.closeLoading();
      return response;
    } catch (error) {
      await this.closeLoading();
      throw error;
    }
  }

  /**
   * Delete Advertiser
   */
  async deleteadvertiser(params: any): Promise<any> {
    await this.presentLoading();
    const url = `${this.uri}/deladvertiser`;
    
    try {
      const response = await lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
      await this.closeLoading();
      return response;
    } catch (error) {
      await this.closeLoading();
      throw error;
    }
  }

  /**
   * Helper method for error handling
   */
  handleError(error: any): string {
    console.error('Service error:', error);
    if (error.status === 0) {
      return 'Network error. Please check your connection.';
    } else if (error.status === 404) {
      return 'Service not found.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else {
      return 'An unexpected error occurred.';
    }
  }
}