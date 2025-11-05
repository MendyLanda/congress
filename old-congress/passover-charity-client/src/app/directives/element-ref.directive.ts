import { Directive, Input, Output, ElementRef } from '@angular/core';

@Directive({
  selector: '[appElementRef]'
})
export class ElementRefDirective {

  constructor(public el:ElementRef) { }

}