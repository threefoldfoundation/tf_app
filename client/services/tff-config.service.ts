import { Config, PluginConfig } from '../../../framework/client/core/utils/config';

export class TffConfig extends PluginConfig {
  public static NAME = 'tff_backend';
  public static VERSION = 'v1.0';
  public static API_URL = `${Config.API_URL}/plugins/${TffConfig.NAME}/${TffConfig.VERSION}`;
}
