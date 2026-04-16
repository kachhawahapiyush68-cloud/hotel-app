import React from "react";
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  Text,
  Pressable,
  ViewStyle,
  StyleProp,
} from "react-native";
import { useThemeStore } from "../../store/themeStore";

export type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  containerStyle,
  editable = true,
  onPress,
  multiline,
  style,
  ...rest
}) => {
  const { theme } = useThemeStore();

  const errorColor = theme.colors.error || theme.colors.danger || "#D64545";
  const borderColor = error ? errorColor : theme.colors.border;
  const isPickerMode = typeof onPress === "function";

  const inputElement = (
    <View pointerEvents={isPickerMode ? "none" : "auto"}>
      <TextInput
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          styles.input,
          multiline ? styles.multilineInput : null,
          {
            color: theme.colors.text,
            borderColor,
            backgroundColor: theme.colors.surface,
          },
          style,
        ]}
        editable={isPickerMode ? false : editable}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        {...rest}
      />
    </View>
  );

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
      ) : null}

      {isPickerMode ? (
        <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
          {inputElement}
        </Pressable>
      ) : (
        inputElement
      )}

      {error ? (
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 4,
    minHeight: 46,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 96,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 11,
    marginTop: 2,
  },
});

export default AppInput;