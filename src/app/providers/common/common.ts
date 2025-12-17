import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LoadingController, Platform, ToastController } from "@ionic/angular";

/*
  Generated class for the CommonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({
  providedIn: "root",
})
export class CommonProvider {
  loading: any;
  profile: any;
  // uri = 'http://constructionmarket.info/zerosoftzst/dynamiccoupons/newrestapi/webservices';
  uri = "https://www.dynamiccoupons.com/App/dynamiccoupons/newrestapi/webservices";

  // uri = 'https://www.dynamiccoupons.com/App/dynamiccoupons/newrestapi_1/webservices';

  constructor(
    public http: HttpClient,
    private _httpClient: HttpClient,
    public loadingController: LoadingController,
    public toastController: ToastController,
    public platform: Platform,
  ) {
    console.log("Hello CommonProvider Provider");
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: "Loading...",
    });
    await this.loading.present();
  }

  async closeLoading() {
    try {
      if (this.loading) {
        await this.loading.dismiss();
        this.loading = null;
      }
    } catch (e) {
      console.warn("Loader already dismissed or not found");
    }
  }

  async presentToast(msg: any) {
    const toast = await this.toastController.create({
      message: `${msg}`,
      duration: 3000,
      position: "bottom",
    });
    toast.present();
  }

  async presentLongToast(msg: any) {
    const toast = await this.toastController.create({
      message: `${msg}`,
      duration: 15000,
    });
    toast.present();
  }

  validateEmail(email: string): boolean {
    const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  }

  validateUrl(url: string): boolean {
    const re = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return re.test(url);
  }

  changedate(conDate: any) {
    let dd: any, MM: any, yy: any;
    dd = conDate.getDate();
    MM = conDate.getMonth() + 1;
    yy = conDate.getFullYear();
    if (dd < 10) {
      dd = "0" + dd;
    }

    if (MM < 10) {
      MM = "0" + MM;
    }
    const endmonth1 = MM + `/` + dd + `/` + yy;
    return endmonth1;
  }

  getTimeStamp(forceDate = false): any {
    const date = new Date(new Date().getTime() + (24 * 3600 * 1000));
    return (this.platform.is("android") && !forceDate) ? date.getTime() : date;
  }

  /**
   * Forgot Password
   *
   * @returns {Promise<any>}
   */
  forgotPassword(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/forgetpassword`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * Forgot Password
   *
   * @returns {Promise<any>}
   */
  forgotPasswordPublisher(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/forgetpasswordpub`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * Forgot Password
   *
   * @returns {Promise<any>}
   */
  forgotPasswordAdvertiser(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/forgetpasswordad`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * Login User
   *
   * @returns {Promise<any>}
   */
  loginform(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/userlogin`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * Get User
   *
   * @returns {Promise<any>}
   */
  getprofile(): Promise<any> {
    this.presentLoading();
    let userid: any = localStorage.getItem("DCloginID");
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.uri}/getprofile/?type=user&userid=${userid}`, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      }).subscribe((response: any) => {
        this.closeLoading();
        resolve(response);
      }, reject);
    });
  }

  /**
   * Add User
   *
   * @returns { Promise<any> }
   */
  registerform(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/registeruser`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * Add Publisher User
   *
   * @returns { Promise<any> }
   */
  registerPublisher(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/registerpublisher`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * Update User
   *
   * @returns {Promise<any>}
   */
  profileupdate(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/profileupdate`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * Update User Password
   *
   * @returns {Promise<any>}
   */
  passwordchange(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/passwrodupdate`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  getsearch(key: any): Promise<any> {
    this.presentLoading();
    return new Promise((resolve, reject) => {
      const encodedKey = encodeURIComponent(key);

      this._httpClient.get(`${this.uri}/getsearch/?search_form=${encodedKey}`, {
        headers: new HttpHeaders({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      }).subscribe((response: any) => {
        // this.closeLoading();
        resolve(response);
      }, reject);
    });
  }

  getsearch1(key: any): Promise<any> {
    // this.presentLoading();
    return new Promise((resolve, reject) => {
      const encodedKey = encodeURIComponent(key);

      this._httpClient.get(`${this.uri}/getsearch/?search_form=${encodedKey}`, {
        headers: new HttpHeaders({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      }).subscribe((response: any) => {
        // this.closeLoading();
        resolve(response);
      }, reject);
    });
  }

  /**
   * Set makeid result
   */
  makeid(length: any) {
    var result = "";
    var characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * Get Coupons Lists (Local or National)
   *
   * @returns {Promise<any>}
   */
  getCouponsList(routeType: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.uri}/getoffer/?type=${routeType}`, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      }).subscribe((response: any) => {
        resolve(response);
        setTimeout(() => {
          this.closeLoading();
        }, 500);
      }, reject);
    });
  }

  getCouponsList1(routeType: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.uri}/getoffer/?type=${routeType}`, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      }).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  /**
   *  get Pricing Lists
   *
   * @returns {Promise<any>}
   */
  getContentlist(routeType: string): Promise<any> {
    this.presentLoading();
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.uri}/getpricinguserid/?userid=${routeType}`, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      }).subscribe((response: any) => {
        resolve(response);
        setTimeout(() => {
          this.closeLoading();
        }, 500);
      }, reject);
    });
  }

  /**
   * Get DC Blog
   *
   * @returns {Promise<any>}
   */
  getemployeeContent(): Promise<any> {
    this.presentLoading();
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.uri}/getdcblog/`, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      }).subscribe((response: any) => {
        resolve(response);
        setTimeout(() => {
          this.closeLoading();
        }, 500);
      }, reject);
    });
  }

  /**
   * Send Contact Form
   *
   * @returns {Promise<any>}
   */

  contactform(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/contactuser`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * Get contents
   *
   * @returns {Promise<any>}
   */
  getEmployeeList(routeType: string): Promise<any> {
    if (routeType !== "contact") {
      this.presentLoading();
      return new Promise((resolve, reject) => {
        this._httpClient.get(`${this.uri}/getcontent/?type=${routeType}`, {
          headers: new HttpHeaders({
            "Content-Type": "application/x-www-form-urlencoded",
          }),
        }).subscribe((response: any) => {
          resolve(response);
          setTimeout(() => {
            this.closeLoading();
          }, 500);
        }, reject);
      });
    }

    return Promise.resolve(null);
  }

  getsubscribeHistory(): Promise<any> {
    this.presentLoading();
    let userid: any = localStorage.getItem("DCloginID");
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.uri}/getsubscribeHistory/?type=user&userid=${userid}`, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      }).subscribe((response: any) => {
        resolve(response);
        setTimeout(() => {
          this.closeLoading();
        }, 500);
      }, reject);
    });
  }

  /**
   * Get Social Link
   *
   * @returns {Promise<any>}
   */
  sociallink(id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.uri}/sociallink/?web_id=${id}`, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      }).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  pricing(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/Pricing`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  siginregister(): Promise<any> {
    let userid: any = localStorage.getItem("DCloginID");
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.uri}/signuplisting/?web_id=${userid}`, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      }).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  referraluser(): Promise<any> {
    this.presentLoading();
    let userid: any = localStorage.getItem("DCpubloginID");
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.uri}/referraluser/?web_id=${userid}`, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      }).subscribe((response: any) => {
        this.closeLoading();
        resolve(response);
      }, reject);
    });
  }

  aduser(params: any): Promise<any> {
    this.presentLoading();
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/aduser_data/`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      }).subscribe((response: any) => {
        this.closeLoading();
        resolve(response);
      }, reject);
    });
  }

  /**
   * Publisher Login User
   *
   * @returns {Promise<any>}
   */
  publisherloginform(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/publisherlogin`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * Advertiser Login User
   *
   * @returns {Promise<any>}
   */
  advertiseloginform(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/advertiserlogin`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * Publisher Get button code
   *
   * @returns {Promise<any>}
   */
  publisherButtoncode(): Promise<any> {
    this.presentLoading();
    let userid: any = localStorage.getItem("DCpubloginID");
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.uri}/getbuttoncode/?web_id=${userid}`, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      }).subscribe((response: any) => {
        this.closeLoading();
        resolve(response);
      }, reject);
    });
  }

  /**
   * Retrieve ad price
   *
   * @returns {Promise<any>}
   */
  retrivePubAdPrice(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/retriveAdPrice`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * Change Ad Publisher
   *
   * @returns {Promise<any>}
   */
  changeAdPublisher(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/changeadprice`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * To make withdraw request from publisher dashboard
   *
   * @returns {Promise<any>}
   */
  sendWithdrawRequest(params: any): Promise<any> {
    this.presentLoading();
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/sendwithdrawreq`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          this.closeLoading();
          resolve(response);
        }, reject);
    });
  }

  /**
   * To get all advertisers whose are registered with logged publisher redeem id
   *
   * @returns {Promise<any>}
   */
  redeemedusers(params: any): Promise<any> {
    this.presentLoading();
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/redeemedadvertisers`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          this.closeLoading();
          resolve(response);
        }, reject);
    });
  }

  /**
   * To get advertiser data who are registered with logged publisher redeem id
   *
   * @returns {Promise<any>}
   */
  viewaduser(params: any): Promise<any> {
    this.presentLoading();
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/viewadvertiser`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          this.closeLoading();
          resolve(response);
        }, reject);
    });
  }

  /**
   * To delete the advertiser belongs to publisher
   *
   * @returns {Promise<any>}
   */
  deleteadvertiser(params: any): Promise<any> {
    this.presentLoading();
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/deladvertiser`, { ...params }, {
        headers: new HttpHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        ),
      })
        .subscribe((response: any) => {
          this.closeLoading();
          resolve(response);
        }, reject);
    });
  }
}
