import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { fileExtensionValidate } from 'src/app/utils/file-extension.validator';
@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.scss']
})
export class AddFileComponent implements OnInit {
  files: File[] = [];
  error: string = "";
  
  constructor(
    public dialogRef: MatDialogRef<AddFileComponent>,
  ) { }

  ngOnInit(): void {
  }

  uploadFile = (event: any) => {
    console.log(event);
    
    if (!fileExtensionValidate(event.target.files[0].name)) {
      this.error = "סוג קובץ לא נתמך, יש להעלות תמונות או PDF בלבד";
      setTimeout(() => { this.error = "" }, 1000 * 3);
    } else {
      this.files = event.target.files;
    }
  }

  closeDialog() {
    this.dialogRef.close(this.files);
  }
}

