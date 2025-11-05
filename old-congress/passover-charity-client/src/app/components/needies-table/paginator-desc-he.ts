import { Injectable } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";

@Injectable()
export class PaginatorDescHe extends MatPaginatorIntl {
    override itemsPerPageLabel = 'שורות להצגה';
    override nextPageLabel = 'לעמוד הבא';
    override previousPageLabel = 'לעמוד הקודם';
  
    override getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return '0 מתוך ' + length;
      }

      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
      return `${startIndex + 1} - ${endIndex} מתוך ${length}`;
    };
}