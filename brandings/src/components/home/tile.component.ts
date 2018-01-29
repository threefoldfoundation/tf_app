import { ChangeDetectionStrategy, Component, Directive, HostBinding, Input } from '@angular/core';
import { TileColor } from '../../interfaces/home';

@Directive({
  selector: 'tile-content',
})
export class TileContentDirective {
  @HostBinding('class') clazz = 'tile-content';
}

@Component({
  selector: 'tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'tile.component.html',
})
export class TileComponent {
  @Input() color: TileColor;
  @Input() image?: string;
  @Input() title?: string;
  @Input() footer?: string;
  @Input() icon?: string;
  @Input() size?: 'half' | 'full' = 'full';
  @HostBinding('class') clazz = 'tile';

  getClass() {
    return `bg-${this.color || 'primary'} tile-${this.size}-height`;
  }
}
