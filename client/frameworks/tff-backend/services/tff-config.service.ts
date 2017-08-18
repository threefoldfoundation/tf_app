import { Config, PluginConfig } from '../../core/utils/config';

export class TffConfig extends PluginConfig {
  public static NAME: string = 'tff_backend';
  public static VERSION: string = 'v1.0';
  public static API_URL: string = `${Config.API_URL}/plugins/${TffConfig.NAME}/${TffConfig.VERSION}`;
}
