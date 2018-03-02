import { ServiceData, UserData } from '../interfaces/rogerthat';
import { appReducer, rogerthatReducer } from '../reducers';
import { IBrandingState } from '../state/app.state';
import { IRogerthatState } from '../state/rogerthat.state';

export interface IAppState {
  app: IBrandingState;
  rogerthat: IRogerthatState<UserData, ServiceData>;
}

export const reducers = {
  app: appReducer,
  rogerthat: rogerthatReducer,
};
