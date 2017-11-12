import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { SeeDocument } from '../../interfaces/see.interfaces';

@Component({
  selector: 'see-document',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'see-document.component.html'
})

export class SeeDocumentComponent {
  @Input() document: SeeDocument;

  dateFormat = 'd MMM y H:mm';
  showFull = false;

  constructor(private cdRef: ChangeDetectorRef) {
  }

  get hasFullDescription() {
    return this.document.markdown_full_description && this.document.markdown_full_description !== this.document.markdown_short_description;
  }

  toggleFullDescription() {
    this.showFull = !this.showFull;
    this.cdRef.detectChanges();
  }

}
