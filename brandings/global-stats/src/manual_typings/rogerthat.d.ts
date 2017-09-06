/**
 * See http://www.rogerthat.net/developers/javascript-api/ for more info
 */
import { RogerthatError, RogerthatMessageOpenError, StartScanningQrCodeError, StopScanningQrCodeError } from './rogerthat-errors';

export * from './rogerthat-errors';

export interface AnyKeyValue {
  [key: string]: any;
}

export interface RogerthatUserInfo {
  name: string;
  account: string;
  avatarUrl: string;
  language: string;
  data: AnyKeyValue;
  put: () => void;
}

export interface RogerthatSystem {
  os: 'ios' | 'android';
  version: string; // '10.1' (iOS) | '25' => android api 25 (Nougat)
  appVersion: string; // '2.0.2000.I'
  appName: string; // 'Rogerthat'
  appId: string; // 'rogerthat'
  onBackendConnectivityChanged: (successCallback: (connectionStatus: InternetConnectionStatus) => void,
                                 errorCallback: () => void) => void;
}

export enum BeaconProximity {
  UNKNOWN = 0,
  IMMEDIATE = 1,
  NEAR = 2,
  FAR = 3
}

export interface Beacon {
  uuid: string;
  major: string;
  minor: string;
  tag: string;
  proximity: BeaconProximity;
}

export interface RogerthatService {
  name: string;
  account: string;
  data: AnyKeyValue;
  getBeaconInReach: (successCallback: (result: Beacon[]) => void, errorCallback: (result: any) => void) => void;
}

export interface RogerthatMessage {
  open: (messageKey: string, successCallback: () => void,
         errorCallback: (error: RogerthatMessageOpenError) => void) => void;
}

export type CameraType = 'front' | 'back';

export interface RogerthatCamera {
  startScanningQrCode: (cameraType: CameraType,
                        successCallback: () => void,
                        errorCallback: (error: StartScanningQrCodeError) => void) => void;
  stopScanningQrCode: (cameraType: CameraType,
                       successCallback: () => void,
                       errorCallback: (error: StopScanningQrCodeError) => void) => void;
}

export interface PublicKey {
  public_key: string;
}

export interface HasKeyPairResult {
  exists: boolean;
}

export interface CryptoSeed {
  seed: string;
}

export interface CryptoAddress {
  address: string;
}

export interface CryptoSignature {
  /**
   * Base64 payload
   */
  payload: string;
  /**
   * Base64 signature
   */
  payload_signature: string;
}

export interface CryptoTransactionInput {
  parent_id: string;
  timelock: number;
}

export interface CryptoTransactionOutput {
  unlockhash: string;
  value: string;
}

export interface CryptoTransactionData {
  input: CryptoTransactionInput;
  outputs: CryptoTransactionOutput[];
  algorithm: SupportedAlgorithms;
  public_key: string;
  public_key_index: number;
  /**
   * base64
   */
  signature_hash: string;
  /**
   * base64 signature, this should be set by using rogerthat.security.sign by the client
   */
  signature?: string;
  timelock: number;
}

export interface CryptoTransaction {
  data: CryptoTransactionData[];
  from_address: string;
  minerfees: string;
  to_address: string;
}

export interface VerifyResult {
  valid: boolean;
}

export type SupportedAlgorithms = 'ed25519';

export interface RogerthatSecurity {
  createKeyPair: (successCallback: (result: PublicKey) => void,
                  errorCallback: (error: RogerthatError) => void,
                  algorithm: SupportedAlgorithms,
                  keyName: string,
                  message: string | null,
                  force: boolean,
                  seed: string) => void;
  hasKeyPair: (successCallback: (result: HasKeyPairResult) => void,
               errorCallback: (error: RogerthatError) => void,
               algorithm: SupportedAlgorithms,
               keyName: string,
               index: number | null) => void;
  getPublicKey: (successCallback: (result: PublicKey) => void,
                 errorCallback: (error: RogerthatError) => void,
                 algorithm: SupportedAlgorithms,
                 keyName: string) => void;
  getSeed: (successCallback: (result: CryptoSeed) => void,
            errorCallback: (error: RogerthatError) => void,
            algorithm: SupportedAlgorithms,
            keyName: string,
            message: string | null) => void;
  getAddress: (successCallback: (result: CryptoAddress) => void,
               errorCallback: (error: RogerthatError) => void,
               algorithm: SupportedAlgorithms,
               keyName: string,
               index: number,
               message: string | null) => void;
  sign: (successCallback: (result: CryptoSignature) => void,
         errorCallback: (error: RogerthatError) => void,
         algorithm: SupportedAlgorithms,
         keyName: string,
         index: number,
         message: string,
         payload: string,
         forcePin: boolean) =>
    void;
  verify: (successCallback: (result: VerifyResult) => void,
           errorCallback: (error: RogerthatError) => void,
           algorithm: SupportedAlgorithms,
           keyName: string,
           index: number,
           payload: string,
           payload_signature: string) => void;
}

export enum FeatureSupported {
  CHECKING = 0,
  SUPPORTED = 1,
  NON_SUPPORTED = 2,
}

export interface RogerthatFeatures {
  base64URI: FeatureSupported;
  backgroundSize: FeatureSupported;
  beacons: FeatureSupported;
  callback: (feature: 'base64URI' | 'backgroundSize' | 'beacons') => void;
}

export interface RogerthatUI {
  hideKeyboard: () => void; // Android only
}

export interface InternetConnectionStatus {
  connected: boolean;
  connectedToWifi?: boolean;
}

interface Translations {
  /**
   * Example: { 'name': {'nl': 'Naam', 'en': 'Name'} }
   */
  [key: string]: { [key: string]: string };
}

export interface RogerthatUtil {
  _translateHTML: () => void;
  _translations: { defaultLanguage: string; values: Translations };
  /**
   * Generate a random UUID
   */
  uuid: () => string;
  /**
   * Play a sound file which is located in the branding zip
   */
  playAudio: (path: string, callback: () => void) => void;
  isConnectedToInternet: (callback: (connectionStatus: InternetConnectionStatus) => void) => void;
  open: (params: AnyKeyValue, successCallback: () => void, errorCallback: () => void) => void;
  translate: (key: string, parameters: AnyKeyValue) => string;
  embeddedAppTranslations: (successCallback: (translations: { translations: AnyKeyValue }) => void,
                            errorCallback: (error: RogerthatError) => void) => void;
}

export interface UserDetails {
  app_id: string; // 'rogerthat'
  avatar_url: string;
  email: string; // 'test@example.com
  language: string; // 'en_US'
  name: string; // 'test user'
  public_key: string | null;
}

export interface QrCodeScannedContent {
  status: 'resolving' | 'resolved' | 'error';
  /**
   * Content of the QR code, or an error message in case status == 'error'
   */
  content: string;
  userDetails?: UserDetails;
}

export interface RogerthatCallbacks {
  /**
   * Rogerthat user and service data has been set
   */
  ready: (callback: () => void) => void;
  /**
   * User pressed back button
   */
  backPressed: (callback: () => void) => void;
  /**
   * The HTML5 app is not visible anymore
   */
  onPause: (callback: () => void) => void;
  /**
   * The HTML5 app is visible again
   */
  onResume: (callback: () => void) => void;
  /**
   * The app received an update and rogerthat.user.data is updated.
   */
  userDataUpdated: (callback: () => void) => void;
  /**
   *  The app received an update and rogerthat.service.data is updated.
   */
  serviceDataUpdated: (callback: () => void) => void;
  /**
   * The device its Internet connectivity has changed.
   */
  onBackendConnectivityChanged: (callback: (connectionStatus: InternetConnectionStatus) => void) => void;
  /**
   * The app detected a beacon.
   */
  onBeaconInReach: (callback: (beacon: Beacon) => void) => void;
  /**
   * The user went out of reach of a beacon.
   */
  onBeaconOutOfReach: (callback: (beacon: Beacon) => void) => void;
  /**
   * A QR code has been scanned as result of rogerthat.camera.startScanningQrCode
   * This method is called twice. If the smartphone is connected to the Internet,
   * the app will request the details of the scanned QR code.
   * The 'userDetails' property will only be available in the second callback.
   */
  qrCodeScanned: (callback: (result: QrCodeScannedContent) => void) => void;
}

export interface RogerthatApiCallbacks {
  resultReceived: (callback: (method: string, result: any, error: string | null, tag: string) => void) => void;
}

export interface RogerthatApi {
  call: (method: string, data: string | null, tag: string) => void;
  callbacks: RogerthatApiCallbacks;
}

export interface Rogerthat {
  api: RogerthatApi;
  callbacks: RogerthatCallbacks;
  camera: RogerthatCamera;
  context: (successCallback: (result: any) => void,
            errorCallback: (error: RogerthatError) => void) => void;
  features: RogerthatFeatures;
  message: RogerthatMessage;
  service: RogerthatService;
  security: RogerthatSecurity;
  system: RogerthatSystem;
  ui: RogerthatUI;
  user: RogerthatUserInfo;
  util: RogerthatUtil;
}

declare global {
  const rogerthat: Rogerthat;
}
