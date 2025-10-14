import 'package:flutter/material.dart';

/// Typography system matching the React Native theme
class AppTypography {
  // Font Sizes
  static const double h1 = 32.0;
  static const double h2 = 24.0;
  static const double h3 = 20.0;
  static const double subtitle1 = 18.0;
  static const double subtitle2 = 16.0;
  static const double body1 = 16.0;
  static const double body2 = 14.0;
  static const double caption = 12.0;
  static const double small = 11.0;

  // Line Heights (as multipliers for Flutter)
  static const double lineHeightH1 = 1.25; // 40/32
  static const double lineHeightH2 = 1.33; // 32/24
  static const double lineHeightH3 = 1.4; // 28/20
  static const double lineHeightSubtitle1 = 1.33; // 24/18
  static const double lineHeightSubtitle2 = 1.375; // 22/16
  static const double lineHeightBody1 = 1.5; // 24/16
  static const double lineHeightBody2 = 1.43; // 20/14
  static const double lineHeightCaption = 1.33; // 16/12
  static const double lineHeightSmall = 1.27; // 14/11

  // Letter Spacing
  static const double tight = -0.5;
  static const double normal = 0.0;
  static const double wide = 0.5;
  static const double wider = 1.0;

  // Text Styles
  static TextStyle h1Style({Color? color}) => TextStyle(
    fontSize: h1,
    fontWeight: FontWeight.w700,
    height: lineHeightH1,
    color: color,
  );

  static TextStyle h2Style({Color? color}) => TextStyle(
    fontSize: h2,
    fontWeight: FontWeight.w700,
    height: lineHeightH2,
    color: color,
  );

  static TextStyle h3Style({Color? color}) => TextStyle(
    fontSize: h3,
    fontWeight: FontWeight.w700,
    height: lineHeightH3,
    color: color,
  );

  static TextStyle subtitle1Style({Color? color}) => TextStyle(
    fontSize: subtitle1,
    fontWeight: FontWeight.w600,
    height: lineHeightSubtitle1,
    color: color,
  );

  static TextStyle subtitle2Style({Color? color}) => TextStyle(
    fontSize: subtitle2,
    fontWeight: FontWeight.w600,
    height: lineHeightSubtitle2,
    color: color,
  );

  static TextStyle body1Style({Color? color}) => TextStyle(
    fontSize: body1,
    fontWeight: FontWeight.w400,
    height: lineHeightBody1,
    color: color,
  );

  static TextStyle body2Style({Color? color}) => TextStyle(
    fontSize: body2,
    fontWeight: FontWeight.w400,
    height: lineHeightBody2,
    color: color,
  );

  static TextStyle captionStyle({Color? color}) => TextStyle(
    fontSize: caption,
    fontWeight: FontWeight.w400,
    height: lineHeightCaption,
    color: color,
  );

  static TextStyle smallStyle({Color? color}) => TextStyle(
    fontSize: small,
    fontWeight: FontWeight.w300,
    height: lineHeightSmall,
    color: color,
  );
}
