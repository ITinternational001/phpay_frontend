import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  //providers: [NgbModalConfig, NgbModal],
})
export class CardComponent implements OnInit {

  @Input() label: string = "";
  @Input() value: string = "";
  @Input() icon: string = "";
  @Input() buttonlabel: string = "";
  @Input() isVisible: boolean = false;
  @Input() isVisiblebtn: boolean = false;
  @Input() isTopUpChanged: boolean = false;
  @Input() data: any; 
  language: string = "";


  constructor(private translateService: TranslateService) { 
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit(): void {
  }



}
