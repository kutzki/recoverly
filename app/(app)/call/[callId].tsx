import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  StreamVideo,
  StreamCall,
  useCallStateHooks,
  ParticipantView,
  Call,
} from '@stream-io/video-react-native-sdk';
import InCallManager from 'react-native-incall-manager';
import { initStreamVideo } from '../../../services/streamVideo';
import { useAuthStore } from '../../../store/auth';
import { Fonts } from '../../../constants/fonts';

// ─── Inner call controls (used inside StreamCall context) ────────────────────
function CallControls({
  onLeave,
  callType,
}: {
  onLeave: () => void;
  callType: string;
}) {
  const {
    useMicrophoneState,
    useCameraState,
    useLocalParticipant,
    useRemoteParticipants,
  } = useCallStateHooks();

  const { microphone } = useMicrophoneState();
  const { camera } = useCameraState();
  const [isSpeakerOn, setIsSpeakerOn] = React.useState(true);
  const [isFlipping, setIsFlipping] = React.useState(false);
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  // ── CRITICAL FIX ──────────────────────────────────────────────────────────
  // isVideoCall is derived from the CALL TYPE passed as a prop — NOT from
  // localParticipant.publishedTracks. The old approach caused camera and flip
  // buttons to disappear whenever the user toggled the camera off (because
  // unpublishing the video track removed TrackType.VIDEO from publishedTracks,
  // making isVideoCall false and hiding both buttons permanently).
  // ──────────────────────────────────────────────────────────────────────────
  const isVideoCall = callType !== 'audio_room';

  const toggleSpeaker = () => {
    const next = !isSpeakerOn;
    InCallManager.setSpeakerphoneOn(next);
    setIsSpeakerOn(next);
  };

  const handleFlip = async () => {
    if (isFlipping) return;
    setIsFlipping(true);
    try {
      await camera.flip();
    } catch (err) {
      console.warn('[Call] camera.flip error:', err);
    } finally {
      setIsFlipping(false);
    }
  };

  return (
    <View style={styles.overlay}>
      {/* Remote video / waiting state */}
      {remoteParticipants.length > 0 ? (
        <View style={styles.remoteVideoArea}>
          <ParticipantView
            participant={remoteParticipants[0]}
            style={styles.remoteVideo}
          />
        </View>
      ) : (
        <View style={styles.waitingArea}>
          <View style={styles.waitingAvatar}>
            <Ionicons name="person" size={48} color="#fff" />
          </View>
          <Text style={styles.waitingText}>Waiting for others to join…</Text>
        </View>
      )}

      {/* Local video PiP — shown only when camera is actively on */}
      {isVideoCall && camera.enabled && localParticipant && (
        <View style={styles.localPip}>
          <ParticipantView
            participant={localParticipant}
            style={styles.localVideo}
          />
        </View>
      )}

      {/* Controls bar */}
      <View style={styles.controls}>

        {/* Mic toggle */}
        <TouchableOpacity
          style={[styles.ctrlBtn, !microphone.enabled && styles.ctrlBtnOff]}
          onPress={() => microphone.toggle()}
        >
          <Ionicons
            name={microphone.enabled ? 'mic' : 'mic-off'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        {/* Camera toggle — always rendered for video calls so user can re-enable */}
        {isVideoCall && (
          <TouchableOpacity
            style={[styles.ctrlBtn, !camera.enabled && styles.ctrlBtnOff]}
            onPress={() => camera.toggle()}
          >
            <Ionicons
              name={camera.enabled ? 'videocam' : 'videocam-off'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        )}

        {/* Speaker toggle */}
        <TouchableOpacity
          style={[styles.ctrlBtn, !isSpeakerOn && styles.ctrlBtnOff]}
          onPress={toggleSpeaker}
        >
          <Ionicons
            name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        {/* Flip camera — always rendered for video calls, shows spinner while flipping */}
        {isVideoCall && (
          <TouchableOpacity
            style={[styles.ctrlBtn, isFlipping && styles.ctrlBtnDisabled]}
            onPress={handleFlip}
            disabled={isFlipping}
          >
            {isFlipping ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        )}

        {/* End call */}
        <TouchableOpacity style={styles.endBtn} onPress={onLeave}>
          <Ionicons
            name="call"
            size={26}
            color="#fff"
            style={{ transform: [{ rotate: '135deg' }] }}
          />
        </TouchableOpacity>

      </View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function CallScreen() {
  const { callId, type = 'default', calleeName = 'Unknown' } = useLocalSearchParams<{
    callId: string;
    type: string;
    calleeName: string;
  }>();

  const { user } = useAuthStore();
  const [client, setClient] = useState<any>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);

  // Normalise: useLocalSearchParams can return string | string[]
  const callType = Array.isArray(type) ? type[0] : (type ?? 'default');
  const callIdStr = Array.isArray(callId) ? callId[0] : callId;
  const isVideoCall = callType !== 'audio_room';

  useEffect(() => {
    let mounted = true;
    let activeCall: Call | null = null;

    async function setup() {
      try {
        const userId = user?.id ?? 'guest_user';
        const userName = user?.name ?? 'Guest';

        const videoClient = await initStreamVideo(userId, userName);
        if (!mounted) return;

        activeCall = videoClient.call(callType, callIdStr);
        await activeCall.getOrCreate();
        await activeCall.join({ create: true });

        if (!mounted) {
          await activeCall.leave().catch(() => {});
          InCallManager.stop();
          return;
        }

        // Start InCallManager: 'video' keeps screen on + uses speaker by default
        InCallManager.start({ media: isVideoCall ? 'video' : 'audio' });
        // Default to speaker for video calls, earpiece for audio-only
        InCallManager.setSpeakerphoneOn(isVideoCall);

        setClient(videoClient);
        setCall(activeCall);
      } catch (err) {
        console.error('[Call] setup error', err);
        Alert.alert('Call Error', 'Could not connect to the call. Please try again.');
        router.back();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    setup();

    return () => {
      mounted = false;
      activeCall?.leave().catch(() => {});
      InCallManager.stop();
    };
  }, [callIdStr, callType, user?.id]);

  const handleLeave = useCallback(async () => {
    try {
      await call?.leave();
    } catch {}
    InCallManager.stop();
    router.back();
  }, [call]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingAvatar}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.loadingName}>
          {decodeURIComponent(Array.isArray(calleeName) ? calleeName[0] : (calleeName ?? 'Unknown'))}
        </Text>
        <Text style={styles.loadingStatus}>Connecting…</Text>
      </View>
    );
  }

  if (!client || !call) return null;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <SafeAreaView style={styles.screen}>
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={handleLeave}>
              <Ionicons name="chevron-down" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.calleeName}>
                {decodeURIComponent(Array.isArray(calleeName) ? calleeName[0] : (calleeName ?? 'Unknown'))}
              </Text>
              <Text style={styles.callStatus}>
                {callType === 'audio_room' ? 'Audio Call' : 'Video Call'}
              </Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          <CallControls onLeave={handleLeave} callType={callType} />

        </SafeAreaView>
      </StreamCall>
    </StreamVideo>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1a1a2e' },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loadingName: { fontSize: 22, fontFamily: Fonts.poppinsBold, color: '#fff' },
  loadingStatus: { fontSize: 15, fontFamily: Fonts.jost, color: 'rgba(255,255,255,0.6)' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, alignItems: 'center' },
  calleeName: { fontSize: 18, fontFamily: Fonts.poppinsBold, color: '#fff' },
  callStatus: { fontSize: 13, fontFamily: Fonts.jost, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  overlay: { flex: 1 },
  remoteVideoArea: { flex: 1 },
  remoteVideo: { flex: 1, borderRadius: 0 },
  waitingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  waitingAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingText: { fontSize: 16, fontFamily: Fonts.jost, color: 'rgba(255,255,255,0.7)' },
  localPip: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  localVideo: { flex: 1 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  ctrlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlBtnOff: { backgroundColor: 'rgba(255,59,48,0.7)' },
  ctrlBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.1)', opacity: 0.6 },
  endBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
});
