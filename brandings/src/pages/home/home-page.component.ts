import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RogerthatService } from '../../services/rogerthat.service';

@Component({
  selector: 'home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'home-page.component.html',
})
export class HomePageComponent implements OnInit {
  constructor(private rogerthatService: RogerthatService) {
  }

  ngOnInit() {
    this.rogerthatService.listNews({}).subscribe(r => console.log('listNews', r));
    this.rogerthatService.countNews().subscribe(r => console.log('countNews', r));
  }
}
