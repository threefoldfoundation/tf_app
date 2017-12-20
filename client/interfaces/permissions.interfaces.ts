export enum TffPermission {
  BACKEND = 'tff.backend',
  BACKEND_ADMIN = 'tff.backend.admin',
}

export class TffPermissions {
  static BACKEND_ADMIN = [ TffPermission.BACKEND, TffPermission.BACKEND_ADMIN ];
}
