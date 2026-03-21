// src/shared/components/Card.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  header?: string;
  subtitle?: string;
  footer?: React.ReactNode;
};

const Card: React.FC<Props> = ({
  children,
  style,
  onPress,
  header,
  subtitle,
  footer,
}) => {
  const { theme } = useThemeStore();

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      {header ? (
        <Text style={[styles.header, { color: theme.colors.text }]}>
          {header}
        </Text>
      ) : null}

      {subtitle ? (
        <Text
          style={[styles.subtitle, { color: theme.colors.textSecondary }]}
        >
          {subtitle}
        </Text>
      ) : null}

      {children}

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  header: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 6,
  },
  footer: {
    marginTop: 8,
  },
});

export default Card;
