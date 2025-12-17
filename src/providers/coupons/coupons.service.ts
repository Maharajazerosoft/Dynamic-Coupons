import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
uri = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
  }

  /**
   * Get pack status for user
   */
  async getPackStatus(): Promise<any> {
    const userid = localStorage.getItem('DCloginID');
    const url = `${this.uri}/getpackstatus/?userid=${userid}`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  /**
   * Update email
   */
  async updateemail(params: any): Promise<any> {
    const url = `${this.uri}/updateemail`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Progressive data upload with progress tracking
   */
  progressiveData(urlparam: string, body: any): HttpRequest<any> {
    return new HttpRequest('POST', `https://www.dynamiccoupons.com/webupload/${urlparam}`, body, {
      reportProgress: true,
    });
  }

  /**
   * Create new coupon
   */
  async createCoupon(params: any): Promise<any> {
    const url = `${this.uri}/createcoupon`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Get categories
   */
  async getcategory(): Promise<any> {
    const url = `${this.uri}/getcategory`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  /**
   * Get subscription packages
   */
  async getsubpkg(): Promise<any> {
    const userid = localStorage.getItem('DCloginID');
    const url = `${this.uri}/getsubscriptionpkg?userid=${userid}`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  /**
   * Get coupon list for user
   */
  async getcouponlist(): Promise<any> {
    const userid = localStorage.getItem('DCloginID');
    const url = `${this.uri}/getcouponlist?web_user_id=${userid}`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  /**
   * Get coupon by ID
   */
  async getcoupon(id: string | number): Promise<any> {
    const url = `${this.uri}/getcouponbyid?web_id=${id}`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  /**
   * Update coupon
   */
  async couponupdate(params: any): Promise<any> {
    const url = `${this.uri}/editcoupon`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Update web capture info
   */
  async webcaptureinfoupdate(params: any): Promise<any> {
    const url = `${this.uri}/updatecoupon`;
    return lastValueFrom(this.http.post(url, params, { headers: this.getHeaders() }));
  }

  /**
   * Delete coupon
   */
  async deletecoupon(id: string | number): Promise<any> {
    const url = `${this.uri}/deletecoupon?web_id=${id}`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  /**
   * View data
   */
  async viewdata(id: string | number): Promise<any> {
    const url = `${this.uri}/viewdata?web_id=${id}`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  /**
   * Error handling helper
   */
  handleError(error: any): string {
    console.error('CouponService error:', error);
    
    if (error.status === 0) {
      return 'Network error. Please check your connection.';
    } else if (error.status === 404) {
      return 'Service not found.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else {
      return 'An error occurred while processing your request.';
    }
  }

  /**
   * Upload file with progress tracking (for file uploads)
   */
  uploadFileWithProgress(url: string, formData: FormData) {
    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true,
      headers: new HttpHeaders()
    });
    
    return this.http.request(req);
  }
}