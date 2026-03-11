/**
 * streamVideo.ts — STUB
 *
 * Video calling via @stream-io/video-react-native-sdk has been disabled because
 * the underlying @stream-io/react-native-webrtc package is a legacy ReactPackage
 * (no TurboModule / codegenConfig).  Its createNativeModules() eagerly calls
 * new WebRTCModule() → PeerConnectionFactory.initialize() → System.loadLibrary
 * ("webrtc"), blocking the main thread for ~5 seconds and causing an Android ANR.
 *
 * All exports are no-ops until the video SDK is replaced with a lazy-loadable
 * alternative.
 */

export async function initStreamVideo(_userId: string, _userName: string): Promise<null> {
  return null;
}

export function getStreamVideoClient(): null {
  return null;
}

export async function disconnectStreamVideo(): Promise<void> {}
