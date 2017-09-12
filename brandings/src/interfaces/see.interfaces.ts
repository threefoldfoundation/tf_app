export interface SeeDocumentVersion {
  version: number;
  category: string;
  link: string;
  content_type: string;
  markdown_short_description: string;
  markdown_full_description: string;
  creation_date: string;
  start_date: string;
  end_date: string;
  keystore_label: string;
  signature: string;
}

export interface SeeDocumentDetails {
  username: string;
  globalid: string;
  uniqueid: string;
  versions: SeeDocumentVersion[];
}

export interface SeeDocument extends SeeDocumentVersion {
  username: string;
  globalid: string;
  uniqueid: string;
}
