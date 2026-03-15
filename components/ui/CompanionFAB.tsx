import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

type Props = {
  onPress: () => void;
  bottomOffset?: number; // distance from screen bottom; caller computes this
};

export function CompanionFAB({ onPress, bottomOffset = 20 }: Props) {
  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: bottomOffset }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Ionicons name="chatbubble-ellipses" size={26} color={Colors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position:        'absolute',
    right:           20,
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    elevation:       6,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.2,
    shadowRadius:    4,
  },
});
