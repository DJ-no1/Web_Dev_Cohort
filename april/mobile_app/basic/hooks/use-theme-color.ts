import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
) {
  // The app uses a strict dark mode theme
  const colorFromProps = props.dark ?? props.light;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[colorName];
  }
}
