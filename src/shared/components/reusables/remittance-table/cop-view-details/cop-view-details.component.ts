import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-cop-view-details',
  templateUrl: './cop-view-details.component.html',
  styleUrls: ['./cop-view-details.component.scss']
})
export class CopViewDetailsComponent implements OnInit, OnDestroy {
  COPForm!: FormGroup;
  private subscription: any;
  fileNamesId: string[] = [];
  fileNamesLetter: string[] = [];

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.COPForm = this.fb.group({
      IDType: [this.data.IDType],
      IdNumber: [this.data.IdNumber],
      FullNameIdHolder: [this.data.FullNameIdHolder],
      MethodDescription: [this.data.MethodDescription]
    });

    this.fileNamesId = this.getFileNamesFromURLs(this.data.IDsURLs);
    this.fileNamesLetter = this.getFileNamesFromURLs(this.data.LettersURLs);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getFileNamesFromURLs(urls: string[]): string[] {
    return urls.map(url => {
      const fileName = url.split('/').pop() || 'Unknown File';
      return fileName.split('?')[0];
    });
  }

  triggerDownload(type: 'IDsURLs' | 'LettersURLs'): void {
    const downloadUrls = this.data[type];

    if (downloadUrls && downloadUrls.length > 0) {
      downloadUrls.forEach((url: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop() || 'download';
        link.click();
      });
    } else {
      console.error('No download URLs found');
    }
  }

  onFilesSelectedId(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      this.fileNamesId = Array.from(input.files).map(file => file.name);
    }
  }

  onFilesSelectedLetter(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      this.fileNamesLetter = Array.from(input.files).map(file => file.name);
    }
  }
}
