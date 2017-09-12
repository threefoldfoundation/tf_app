import { Injectable, Pipe, PipeTransform } from '@angular/core';
import * as marked from 'marked';

@Injectable()
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null) {
    return value ? marked(value) : '';
  }
}
