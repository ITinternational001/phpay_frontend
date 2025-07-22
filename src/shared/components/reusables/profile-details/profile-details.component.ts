import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AgentListData } from 'src/shared/dataprovider/api/model/agentListData';
import { AgentListDTO } from 'src/shared/dataprovider/api/model/agentListDTO';
import { AgentType } from 'src/shared/dataprovider/local/data/common';
import { getAgentTypeName } from 'src/shared/helpers/helper';


@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit {
  @Input() details: any;
  public agent!: any;
  public agentType:string | undefined = "";
  language: string = "";

  constructor(private translateService: TranslateService){
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }
  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['details'] && changes['details'].currentValue) {
      if (this.details?.Agents?.length) {
        this.agent = this.details.Agents[0];
        this.agentType = getAgentTypeName(this.agent.AgentType, AgentType);
      } else {
        this.agent = undefined;  // Handle the case when there are no agents
        this.agentType = undefined; // Assign undefined instead of null
      }
    }
  }
  

}
