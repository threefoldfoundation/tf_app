import { Injectable } from '@angular/core';

export interface CSVHeader {
  key: string;
  label: string;
}

export interface CSVOptions {
  fieldSeparator: string;
  quoteStrings: string;
  decimalSeparator: string;
  showLabels: boolean;
  showTitle: boolean;
  title: string;
  useBom: boolean;
  headers: CSVHeader[];
}

export class CsvConfigConsts {
  public static EOL = '\r\n';
  public static BOM = '\ufeff';
  public static DEFAULT_FIELD_SEPARATOR = ',';
  public static DEFAULT_DECIMAL_SEPARATOR = '.';
  public static DEFAULT_QUOTE = '"';
  public static DEFAULT_SHOW_TITLE = false;
  public static DEFAULT_TITLE = '';
  public static DEFAULT_SHOW_LABELS = false;
  public static DEFAULT_USE_BOM = true;
  public static DEFAULT_HEADERS: CSVHeader[] = [];

}

export const ConfigDefaults: CSVOptions = {
  fieldSeparator: CsvConfigConsts.DEFAULT_FIELD_SEPARATOR,
  quoteStrings: CsvConfigConsts.DEFAULT_QUOTE,
  decimalSeparator: CsvConfigConsts.DEFAULT_DECIMAL_SEPARATOR,
  showLabels: CsvConfigConsts.DEFAULT_SHOW_LABELS,
  showTitle: CsvConfigConsts.DEFAULT_SHOW_TITLE,
  title: CsvConfigConsts.DEFAULT_TITLE,
  useBom: CsvConfigConsts.DEFAULT_USE_BOM,
  headers: CsvConfigConsts.DEFAULT_HEADERS,
};

@Injectable()
export class CSVService {
  generateCsv(data: any, filename: string, options?: Partial<CSVOptions>) {
    const configuration: CSVOptions = { ...ConfigDefaults, ...(options || {}) };
    let csv = '';
    if (configuration.useBom) {
      csv += CsvConfigConsts.BOM;
    }

    if (configuration.showTitle) {
      csv += configuration.title + '\r\n\n';
    }

    csv += this.getHeaders(configuration);
    csv += this.getBody(data, configuration);

    if (csv === '') {
      return;
    }

    const blob = new Blob([ csv ], { 'type': 'text/csv;charset=utf8;' });

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename.replace(/ /g, '_') + '.csv');
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('visibility', 'hidden');
      link.download = filename.replace(/ /g, '_') + '.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private getHeaders(options: CSVOptions): string {
    let row = '';
    for (const header of options.headers) {
      row += header.label + options.fieldSeparator;
    }
    if (row) {
      row = row.slice(0, -1) + CsvConfigConsts.EOL;
    }
    return row;
  }

  private getBody(data: any[], options: CSVOptions): string {
    let body = '';
    for (const row of data) {
      let rowString = '';
      for (const header of options.headers) {
        const column = row[ header.key ];
        rowString += this.formatData(column, options) + options.fieldSeparator;
      }
      body += rowString.slice(0, -1) + CsvConfigConsts.EOL;
    }
    return body;
  }

  private formatData(data: any, options: CSVOptions) {

    if (options.decimalSeparator === 'locale' && typeof data === 'number') {
      return data.toLocaleString();
    }

    if (options.decimalSeparator !== '.' && typeof data === 'number') {
      return data.toString().replace('.', options.decimalSeparator);
    }

    if (typeof data === 'string') {
      data = data.replace(/"/g, '""');
      if (options.quoteStrings || data.indexOf(',') > -1 || data.indexOf('\n') > -1 || data.indexOf('\r') > -1) {
        data = options.quoteStrings + data + options.quoteStrings;
      }
      return data;
    }

    if (typeof data === 'boolean') {
      return data ? 'TRUE' : 'FALSE';
    }
    return data;
  }
}
