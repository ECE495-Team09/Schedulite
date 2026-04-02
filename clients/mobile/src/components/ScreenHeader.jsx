import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../theme';

export default function ScreenHeader({ navigation, backLabel, contextLabel, title, onBack }) {
  const handleBack = onBack || (() => navigation.goBack());
  return (
    <View style={styles.wrap}>
      <Pressable onPress={handleBack} hitSlop={12}>
        <Text style={styles.back}>{backLabel}</Text>
      </Pressable>
      {contextLabel ? <Text style={styles.context}>{contextLabel}</Text> : null}
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  back: { color: theme.accent, fontSize: 15, marginBottom: 6 },
  context: { fontSize: 13, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '700', color: theme.text },
});
