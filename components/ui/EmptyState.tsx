import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

interface EmptyStateProps {
  image?: ImageSourcePropType;
  title: string;
  description: string;
  actionText?: string;
  onActionPress?: () => void;
  containerStyle?: object;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  image = require('@/assets/illustrations/no_favorites.png'),
  title,
  description,
  actionText,
  onActionPress,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.content}>
        <Image 
          source={image} 
          style={styles.image} 
          resizeMode="contain"
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        
        {actionText && onActionPress && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={onActionPress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: 'transparent',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: 280,
    height: 280,
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 22,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: Fonts.jost,
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 16,
    color: Colors.white,
  },
});
