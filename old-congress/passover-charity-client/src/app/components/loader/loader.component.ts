import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoaderComponent implements OnInit {

  constructor(
    public loaderService: LoaderService
  ) { }

  ngOnInit(): void {
  }

}
