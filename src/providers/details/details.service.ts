import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DetailsService {
  uri = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
  }

  /**
   * Get coupon content
   */
  async getContent(cid: string | number): Promise<any> {
    const url = `${this.uri}/getcoupon/?type=coupon&cid=${cid}`;
    return lastValueFrom(this.http.get(url, { headers: this.getHeaders() }));
  }

  /**
   * Update email
   */
  async updateemail(params: any): Promise<any> {
    const url = `${this.uri}/updateemail`;
    return lastValueFrom(
      this.http.post(url, params, { headers: this.getHeaders() })
    );
  }

  /**
   * Send coupon to email
   */
  async sendcoupontoemail(params: any): Promise<any> {
    const url = `${this.uri}/sendcoupontoemail`;
    return lastValueFrom(
      this.http.post(url, params, { headers: this.getHeaders() })
    );
  }

  /**
   * Update click count
   */
  async updateclick(params: any): Promise<any> {
    const url = `${this.uri}/updateclick`;
    return lastValueFrom(
      this.http.post(url, params, { headers: this.getHeaders() })
    );
  }

  /**
   * Error handling helper
   */
  handleError(error: any): string {
    console.error('DetailsService error:', error);

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
}
