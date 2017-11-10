import { Injectable, Pipe, PipeTransform } from '@angular/core';
import * as marked from 'marked';

@Injectable()
@Pipe({ name: 'markdown', pure: true })
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null, options?: marked.MarkedOptions) {
    return value ? marked(value, options) : '';
  }

  public static setOptions(options: marked.MarkedOptions): void {
    marked.setOptions(options);
  }
}
