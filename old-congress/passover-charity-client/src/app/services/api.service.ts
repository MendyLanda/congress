import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GetAvrechRequestStatus } from '../../../../shared/interfaces/get-avrech-request-status.interface';
import { Needy } from '../../../../shared/interfaces/needy.interface';
import { Payment } from '../../../../shared/interfaces/payment.interface';
import { Project } from '../../../../shared/interfaces/project.interface';
import { Student } from '../../../../shared/interfaces/student.interface';
import { SupportRecommendation } from '../../../../shared/interfaces/support-recommendation.interface';
import { User } from '../../../../shared/interfaces/user.interface';
import { UpdateEmailRequest } from '../../../../shared/interfaces/update-email-request.interface';
import { UpdateBankDetailsRequest } from '../../../../shared/interfaces/update-bank-details-request.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) { }


  //-- login --//
  login(username: string, password: string) {
    return this.http.post(this.apiEndPoint(`auth/login`), { username, password }) as any;
  }

  checkLogin() {
    return this.http.get(this.apiEndPoint(`auth/login`), this.options) as Observable<number>;
  }

  getProjects() {
    return this.http.get(this.apiEndPoint(`project`), this.options) as Observable<Project[]>;
  }

  //-- sign in --//
  isUsernameValid = (username: string) => {
    return this.http.get(this.apiEndPoint(`user/username-valid/${username}`), this.options) as Observable<boolean>;
  }

  registerUser = (newUser: Partial<User>, captchaToken: string) => {
    return this.http.post(this.apiEndPoint(`user/register`), { ...newUser, captchaToken }) as Observable<boolean>;
  }

  createUser = (newUser: Partial<User>) => {
    return this.http.post(this.apiEndPoint(`user`), newUser, this.options) as Observable<boolean>;
  }

  updateUser = (userId: number, updated: Partial<User>) => {
    return this.http.patch(this.apiEndPoint(`user/${userId}`), updated, this.options) as Observable<User>;
  }

  //-- needy --//
  findAllWithLastStatuses(projectId: number) {
    return this.http.get(this.apiEndPoint(`needy/all/${projectId}`), this.options) as Observable<Needy[]>;
  }

  getNeedyFullDetails(id: number) {
    return this.http.get(this.apiEndPoint(`needy/${id}`), this.options) as Observable<Needy>;
  }

  createNeedy(needy: Needy) {
    const options: any = this.options;

    // options.headers["Content-Type"] = "multipart/form-data";
    return this.http.post(this.apiEndPoint(`needy`), needy, options) as Observable<any>;
  }

  createAvrech(needy: Needy, captchaToken: string) {
    const options: any = this.options;

    // options.headers["Content-Type"] = "multipart/form-data";
    return this.http.post(this.apiEndPoint(`needy/avrech`), { ...needy, captchaToken }, options) as Observable<any>;
  }

  checkNeedyStatusRequest = (captchaToken: string, getStatusElement: GetAvrechRequestStatus) => {
    return this.http.post(this.apiEndPoint(`needy/avrech/status`), { ...getStatusElement, captchaToken }, this.options) as Observable<any>;
  }

  updateNeedy(id: number, needyUpdated: Partial<Needy>) {
    return this.http.patch(this.apiEndPoint(`needy/${id}`), needyUpdated, this.options) as Observable<any>;
  }

  updateEmail(captchaToken: string, updateEmailForm: UpdateEmailRequest) {
    return this.http.patch(this.apiEndPoint(`needy/avrech/update-email`), { ...updateEmailForm, captchaToken }, this.options) as Observable<any>;
  }

  updateBankDetails(captchaToken: string, updateBankDetailsForm: UpdateBankDetailsRequest) {
    return this.http.patch(this.apiEndPoint(`needy/avrech/update-bank-details`), { ...updateBankDetailsForm, captchaToken }, this.options) as Observable<any>;
  }

  deleteNeedy(id: number) {
    return this.http.delete(this.apiEndPoint(`needy/${id}`), this.options) as Observable<any>;
  }

  updateStudent(id: number, studentUpdated: Partial<Student>) {
    return this.http.patch(this.apiEndPoint(`needy/student/${id}`), studentUpdated, this.options) as Observable<Student>;
  }

  isDuplicateSSN(ssn: string, projectId: number) {
    return this.http.post(this.apiEndPoint(`needy/is-duplicate-ssn`), { ssn, projectId }, this.options) as Observable<number[]>;
  }

  addSupportRecommendation(sum: number, needyId: number, projectId: number) {
    return this.http.post(this.apiEndPoint(`needy/recommendation`), { sum, needyId, projectId }, this.options) as Observable<SupportRecommendation>;
  }

  allPayments = (projectId: number) => {
    return this.http.get(this.apiEndPoint(`payment/${projectId}`), this.options) as Observable<Payment[]>;
  }

  addPayment(payment: Partial<Payment>) {
    return this.http.post(this.apiEndPoint(`needy/payment`), payment, this.options) as Observable<Payment>;
  }

  deletePayment(id: number) {
    return this.http.delete(this.apiEndPoint(`needy/payment/${id}`), this.options) as Observable<Needy[]>;
  }

  getPaymentsByNeedyIds = (ids: number[]) => {
    return this.http.post(this.apiEndPoint(`needy/get-payment-by-needies`), ids, this.options) as Observable<Payment[]>;
  }

  getDocumentUrl = (id: number) => this.apiEndPoint(`needy/document/${id}`)

  addDocument(file: File, needyId: number, projectId: number, paymentId?: number) {
    const formData = new FormData();

    formData.append("doc", file);
    formData.append("fileName", file.name);
    formData.append("needyId", needyId.toString());
    formData.append("projectId", projectId.toString());

    if (paymentId) {
      formData.append("paymentId", paymentId.toString());
    }

    return this.http.post(this.apiEndPoint(`needy/document`), formData, this.options) as Observable<{ doc: string }>;
  }

  addDocumentAvrech(captchaToken: string, file: File, needyId: number, projectId: number, paymentId?: number, ssn?: string, fileName?: string) {
    const formData = new FormData();

    formData.append("doc", file);
    formData.append("fileName", fileName || file.name);
    formData.append("needyId", needyId.toString());
    formData.append("projectId", projectId.toString());
    formData.append("ssn", ssn || "");
    formData.append("captchaToken", captchaToken);

    if (paymentId) {
      formData.append("paymentId", paymentId.toString());
    }

    const options = { ...this.options, headers: { ...this.options.headers, "captchaToken": captchaToken } };

    return this.http.post(this.apiEndPoint(`needy/avrech/document`), formData, options) as Observable<{ doc: string }>;
  }

  getDocument(id: number) {
    return this.http.get(this.apiEndPoint(`needy/document/${id}`), { ...this.options, responseType: 'arraybuffer' }) as Observable<any>;
  }

  getDocumentName(id: number) {
    return this.http.get(this.apiEndPoint(`needy/document/name/${id}`), this.options) as Observable<any>;
  }

  deleteDocument(id: number) {
    return this.http.delete(this.apiEndPoint(`needy/document/${id}`), this.options) as Observable<number>;
  }

  //-- users --//
  getUsers = (projectId: number) => {
    return this.http.get(this.apiEndPoint(`user/all/${projectId}`), this.options) as Observable<User[]>;
  }

  getUserById = (id: number) => {
    return this.http.get(this.apiEndPoint(`user/${id}`), this.options) as Observable<User[]>;
  }

  approveUser = (id: number) => {
    return this.http.get(this.apiEndPoint(`user/approve/${id}`), this.options) as Observable<boolean>;
  }

  declineUser = (id: number) => {
    return this.http.get(this.apiEndPoint(`user/decline/${id}`), this.options) as Observable<boolean>;
  }

  get options() {
    let token = this.cookieService.get(environment.cookies.authToken.title);
    const headerDict = { "Authorization": "Bearer " + token }

    return { headers: headerDict };
  }

  private apiEndPoint(endpoint: string) {
    if (endpoint && endpoint.startsWith('/')) {
      endpoint = endpoint.substring(1);
    }
    return `${environment.apiServerURL}/api/${endpoint}`;
  }
}
