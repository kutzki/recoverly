import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type NotificationType = 'meeting' | 'follow' | 'checkin' | 'comment' | 'like' | 'LINK_REQUEST' | 'LINK_ACCEPTED' | 'CHEER' | 'EMERGENCY';

interface NotificationItemProps {
  id: string;
  type: NotificationType;
  userName?: string;
  timeAgo: string;
  content?: string;
  imageUri?: string;
  isRead?: boolean;
  onPressAction?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}

export function NotificationItem({ id, type, userName, timeAgo, content, imageUri, isRead, onPressAction, onAccept, onDecline }: NotificationItemProps) {
  const renderIconOrAvatar = () => {
    if (type === 'meeting') {
      return (
        <View style={[styles.avatarBox, styles.meetingBorder]}>
          <Text style={styles.fallbackEmotion}>NA</Text>
        </View>
      );
    }
    if (type === 'checkin') {
      return (
        <View style={[styles.avatarBox, { backgroundColor: Colors.primary }]}>
          <Ionicons name="checkmark" size={30} color={Colors.white} />
        </View>
      );
    }
    if (type === 'LINK_REQUEST' || type === 'CHEER' || type === 'EMERGENCY') {
      const icon = type === 'LINK_REQUEST' ? 'shield-outline' : type === 'CHEER' ? 'heart' : 'alert-circle';
      const bgColor = type === 'EMERGENCY' ? Colors.error : Colors.primary;
      return (
        <View style={[styles.avatarBox, { backgroundColor: bgColor }]}>
          <Ionicons name={icon as any} size={28} color={Colors.white} />
        </View>
      );
    }
    return (
      <View style={[styles.avatarBox, isRead === false && styles.unreadIndicator]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="person-circle-outline" size={54} color={Colors.notifImageBg} />
        )}
      </View>
    );
  };

  const renderTextContent = () => {
    if (type === 'meeting') {
      return (
        <Text style={styles.textBody}>
          Your scheduled meeting is about to begin.{' '}
          <Text style={styles.timeText}>{timeAgo}</Text>
        </Text>
      );
    }
    if (type === 'checkin') {
      return (
        <Text style={styles.textBody}>
          Have you completed your check in today?{' '}
          <Text style={styles.timeText}>{timeAgo}</Text>
        </Text>
      );
    }
    
    if (type === 'LINK_REQUEST') {
      return (
        <View>
          <Text style={styles.textBody}>
            <Text style={styles.userName}>{userName}</Text> wants to be your Guardian.
            {' '}<Text style={styles.timeText}>{timeAgo}</Text>
          </Text>
        </View>
      );
    }
    if (type === 'CHEER') {
      return (
        <Text style={styles.textBody}>
          <Text style={styles.userName}>{userName}</Text> cheered your progress! 🎉
          {' '}<Text style={styles.timeText}>{timeAgo}</Text>
        </Text>
      );
    }
    
    const actionText = type === 'follow' ? 'started following you.' : type === 'like' ? 'liked your photo.' : 'commented:';
    
    return (
      <View>
        <Text style={styles.textBody}>
          <Text style={styles.userName}>{userName}</Text> {actionText}
          {type === 'comment' && content ? ` ${content}` : ''}{' '}
          <Text style={styles.timeText}>{timeAgo}</Text>
        </Text>
        {type === 'comment' && (
          <TouchableOpacity style={styles.replyBtn} onPress={onPressAction} hitSlop={10}>
            <Text style={styles.replyText}>Reply</Text>
            <Ionicons name="arrow-undo-outline" size={10} color={Colors.text} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderRightAction = () => {
    if (type === 'meeting') {
      return (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.notifBlueBtn }]} onPress={onPressAction}>
          <Text style={styles.actionBtnText}>Enter</Text>
        </TouchableOpacity>
      );
    }
    if (type === 'follow') {
      return (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.notifPurpleBtn }]} onPress={onPressAction}>
          <Text style={styles.actionBtnText}>Follow</Text>
        </TouchableOpacity>
      );
    }
    if (type === 'checkin') {
      return (
        <Ionicons name="arrow-forward" size={24} color={Colors.text} style={styles.arrowIcon} />
      );
    }
    if (type === 'LINK_REQUEST' && !isRead) {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.miniActionBtn, { backgroundColor: Colors.success }]} onPress={onAccept}>
            <Ionicons name="checkmark" size={16} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.miniActionBtn, { backgroundColor: Colors.border }]} onPress={onDecline}>
            <Ionicons name="close" size={16} color={Colors.text} />
          </TouchableOpacity>
        </View>
      );
    }
    if (type === 'CHEER') {
      return (
        <Ionicons name="heart" size={24} color={Colors.error} />
      );
    }
    if (type === 'comment' || type === 'like') {
      return (
        <View style={styles.thumbnailBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.thumbnailImage} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.notifImageBg, borderRadius: 8 }]} />
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        {renderIconOrAvatar()}
        <View style={styles.textContent}>
          {renderTextContent()}
        </View>
      </View>
      <View style={styles.rightGroup}>
        {renderRightAction()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  meetingBorder: {
    borderWidth: 1,
    borderColor: Colors.text,
  },
  fallbackEmotion: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.text,
  },
  textContent: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontFamily: Fonts.generalSansMedium || Fonts.poppinsSemiBold,
    fontSize: 14,
    color: Colors.text,
  },
  textBody: {
    fontFamily: Fonts.generalSansRegular || Fonts.poppins,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  timeText: {
    color: Colors.notifTimeText,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  replyText: {
    fontFamily: Fonts.generalSansMedium || Fonts.poppinsMedium,
    fontSize: 10,
    color: Colors.text,
  },
  rightGroup: {
    flexShrink: 0,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 67,
  },
  actionBtnText: {
    fontFamily: Fonts.generalSansMedium || Fonts.poppinsMedium,
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 0.375,
  },
  arrowIcon: {
    opacity: 0.8,
  },
  thumbnailBox: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: Colors.notifImageBg,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  unreadIndicator: {
    borderRightWidth: 4,
    borderRightColor: Colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
