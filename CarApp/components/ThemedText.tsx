import { Text, type TextProps, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { typography } from "@/app/theme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "h1"
    | "h2"
    | "h3"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2"
    | "caption"
    | "small"
    | "link";
  bold?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "body1",
  bold = false,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[{ color }, styles[type], bold && styles.bold, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  h1: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h1,
    lineHeight: typography.lineHeights.h1,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h2,
    lineHeight: typography.lineHeights.h2,
    letterSpacing: typography.letterSpacing.tight,
  },
  h3: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h3,
    lineHeight: typography.lineHeights.h3,
    letterSpacing: typography.letterSpacing.normal,
  },
  subtitle1: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.subtitle1,
    lineHeight: typography.lineHeights.subtitle1,
    letterSpacing: typography.letterSpacing.normal,
  },
  subtitle2: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.subtitle2,
    lineHeight: typography.lineHeights.subtitle2,
    letterSpacing: typography.letterSpacing.normal,
  },
  body1: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    letterSpacing: typography.letterSpacing.normal,
  },
  body2: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    letterSpacing: typography.letterSpacing.normal,
  },
  caption: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
    letterSpacing: typography.letterSpacing.normal,
  },
  small: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    lineHeight: typography.lineHeights.small,
    letterSpacing: typography.letterSpacing.normal,
  },
  link: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    letterSpacing: typography.letterSpacing.wide,
    color: "#0a7ea4",
    textDecorationLine: "underline",
  },
  bold: {
    fontFamily: typography.fonts.bodyBold,
  },
});
