// src/shared/components/AppInput.tsx
import React from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';

export type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle | ViewStyle[];
  onPress?: () => void;
};

const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  containerStyle,
  editable = true,
  onPress,
  ...rest
}) => {
  const { theme } = useThemeStore();
  const borderColor = error ? theme.colors.danger : theme.colors.border;

  const inputElement = (
    <TextInput
      placeholderTextColor={theme.colors.textSecondary}
      style={[
        styles.input,
        {
          color: theme.colors.text,
          borderColor,
          backgroundColor: theme.colors.surface,
        },
      ]}
      editable={editable && !onPress}
      {...rest}
    />
  );

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
      ) : null}

      {onPress ? (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
          {inputElement}
        </TouchableOpacity>
      ) : (
        inputElement
      )}

      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 11,
    marginTop: 2,
  },
});

export default AppInput;
