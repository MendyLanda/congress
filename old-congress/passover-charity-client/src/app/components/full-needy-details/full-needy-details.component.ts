import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NeedyElement } from 'src/app/interfaces/needy-element.interface';
import { ApiService } from 'src/app/services/api.service';
import { NeedyDataServiceService } from 'src/app/services/needy-data-service.service';
import { ToastyService } from 'src/app/services/toasty.service';
import { fileToBase64 } from 'src/app/utils/file-to-base64';
import { NeedyType } from '../../../../../shared/enums/needy-type.enum';
import { PaymentMethod } from '../../../../../shared/enums/payment-method.enum';
import { CouponCard } from '../../../../../shared/interfaces/coupon-card.interface';
import { Needy } from '../../../../../shared/interfaces/needy.interface';
import { Payment } from '../../../../../shared/interfaces/payment.interface';
import { Student } from '../../../../../shared/interfaces/student.interface';
import { SupportRecommendation } from '../../../../../shared/interfaces/support-recommendation.interface';
import { User } from '../../../../../shared/interfaces/user.interface';
import { AddFileComponent } from '../dialogs/add-file/add-file.component';
import { AddPaymentFormComponent } from '../dialogs/add-payment-form/add-payment-form.component';
import { UpdateStudentDetailsComponent } from '../dialogs/update-student-details/update-student-details.component';

@Component({
  selector: 'app-full-needy-details',
  templateUrl: './full-needy-details.component.html',
  styleUrls: ['./full-needy-details.component.scss']
})
export class FullNeedyDetailsComponent implements OnInit, AfterViewInit {
  @Input() needy!: NeedyElement;
  readonly PaymentMethod = PaymentMethod;
  descriptionEditMode: boolean = false;
  messagesEditMode: boolean = false;

  fullDetails: Needy | undefined;

  constructor(
    private apiService: ApiService,
    private toastyService: ToastyService,
    private needyDataServiceService: NeedyDataServiceService,
    public dialog: MatDialog,
  ) { }

  get NeedyType() {
    return NeedyType;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.updateDetails();
  }

  getSerialNumber = (payment: Payment) => payment.card?.serialNumber;

  getTotalAmounts = () => this.fullDetails?.payments?.reduce((sum, p) => sum + p.amount, 0);

  addDocument = () => {
    const dialogRef = this.dialog.open(AddFileComponent, {
      maxHeight: '70vh'
    });

    dialogRef.afterClosed().subscribe(async files => {
      if (!files || !files.length) {
        return;
      }

      this.apiService.addDocument(files[0], this.fullDetails!.id!, this.fullDetails!.projectId).subscribe(res => {
        this.toastyService.success("המסמך נוסף בהצלחה");
        this.updateDetails();
      });
    });

  }

  deleteDocument = (id: number) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את המסמך?`) == true) {
      this.apiService.deleteDocument(id).subscribe(res => {
        this.toastyService.success("המסמך נמחק בהצלחה");
        this.updateDetails();
      })
    }
  }

  getDocumentURL = (docId: number) => this.apiService.getDocumentUrl(docId)

  getDocument = (docId: number, docName: string) => this.apiService.getDocument(docId).subscribe(res => {
    const postFix = this.getFilePostfix(docName);

    const blob = new Blob([res], { type: this.getBlobType(postFix) });
    const URL = window.URL || window.webkitURL;
    const dataUrl = URL.createObjectURL(blob);
    window.open(dataUrl, '_blank');
  })

  private _addPayment = () => {
    const dialogRef = this.dialog.open(AddPaymentFormComponent, {
      maxHeight: '70vh'
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) {
        return;
      }

      this.apiService.addPayment({
        amount: +result.amount,
        date: result.date,
        type: result.type,
        receiver: result.receiver,
        needyId: this.needy.id,
        serialNumber: result.couponNumber,
        cardId: +result.cardId,
        projectId: this.fullDetails?.projectId
      }).subscribe(res => {
        this.toastyService.success("התשלום נוסף בהצלחה");

        if (!result.receiver) {
          this.updateDetails();
        } else {
          this.apiService.addDocument(result.receiverSignature._files[0], this.fullDetails!.id!, this.fullDetails!.projectId, res.id).subscribe(res => {
            this.toastyService.success("חתימת המקבל נשמרה בהצלחה");
            this.updateDetails();
          });
        }

        if (res.type == PaymentMethod.Card) {
          this.needyDataServiceService.addPaymentToNeedy(res);
        }
      });
    });

  };
  public get addPayment() {
    return this._addPayment;
  }
  public set addPayment(value) {
    this._addPayment = value;
  }

  deletePayment = (id: number) => {
    if (confirm(`האם אתה בטוח שברצונך להסיר את תיעוד התשלום?`) == true) {
      this.apiService.deletePayment(id).subscribe(res => {
        this.toastyService.success("התשלום נמחק בהצלחה");
        this.updateDetails();
      })
    }
  }

  getReceiverSignature = (docId: number) => {
    this.apiService.getDocumentName(docId).subscribe({
      next: (res) => {
        this.getDocument(docId, res.fileName);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  editStudentDetails = () => {
    const dialogRef = this.dialog.open(UpdateStudentDetailsComponent, {
      data: this.fullDetails!.student,
      maxHeight: '70vh',
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (!result) {
        return;
      }

      result.projectId = this.fullDetails!.projectId;
      this.apiService.updateStudent(result.id, result)
        .subscribe(res => {
          this.toastyService.success("פרטי האברך עודכנו בהצלחה");
          this.updateDetails();
        });
    });
  }

  updateDescription = (desc: string) => {
    this.apiService.updateNeedy(this.fullDetails!.id!, { description: desc }).subscribe(res => {
      this.descriptionEditMode = false;
      this.toastyService.success("הפרטים עודכנו בהצלחה");
      this.updateDetails();
    })
  }

  updateMessage = (messages: string) => {
    this.apiService.updateNeedy(this.fullDetails!.id!, { messages }).subscribe(res => {
      this.messagesEditMode = false;
      this.toastyService.success("ההודעה עודכנה בהצלחה");
      this.updateDetails();
    })
  }

  getRecommenderName = (rec: SupportRecommendation) => `הומלץ ע"י: ${rec.recommender?.firstName || ""} ${rec.recommender?.lastName || ""}`
  getUserEnter = (payment: Payment) => `הוזן ע"י: ${payment.userEnter?.firstName || ""} ${payment.userEnter?.lastName || ""}`

  updateDetails = () => {
    this.apiService.getNeedyFullDetails(this.needy.id!).subscribe(res => {
      this.fullDetails = res;

      this.apiService.updateNeedy(this.fullDetails!.id!, { newDocs: 0 }).subscribe(res => {
        this.needyDataServiceService.resetNewDocs(this.fullDetails!.id!)
      });
    })
  }

  getFilePostfix = (fileName: string) => {
    const splitted = fileName.split(".");
    return splitted[splitted.length - 1];
  }

  getBlobType = (postfix: string) => postfix == "pdf" ? "application/pdf" : "image/png"

  getWifeName = (student: Student) => `${student.firstNameWife} ${student.lastNameWife}`

  isWelfareForm = () => this.fullDetails?.type == NeedyType.Welfare || this.fullDetails?.type == NeedyType.Needy
}