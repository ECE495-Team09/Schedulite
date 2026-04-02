import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { createGroup } from '../api/client';
import { theme } from '../theme';

export default function CreateGroup({ navigation }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await createGroup(name.trim());
      const id = res.group?._id || res.group?.id;
      navigation.replace('Group', { groupId: String(id) });
    } catch (err) {
      setError(err.message || 'Failed to create group.');
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backLink}>← Back to Home</Text>
        </Pressable>
        <Text style={styles.heading}>Create a Group</Text>
        <Text style={styles.subheading}>
          Start a new group and invite members using an auto-generated join code.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Group Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. CS 490 Project Team"
            placeholderTextColor={theme.textFaint}
            maxLength={80}
          />
          <Text style={styles.hint}>{name.length}/80 characters</Text>
          {error ? <Text style={styles.errorMsg}>{error}</Text> : null}

          <View style={styles.formFooter}>
            <Pressable style={styles.cancelBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.submitBtn, (!name.trim() || submitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting || !name.trim()}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Creating…' : 'Create Group'}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bg },
  page: { padding: 20, paddingBottom: 40 },
  backLink: { color: theme.accent, fontSize: 15, marginBottom: 16 },
  heading: { fontSize: 26, fontWeight: '700', color: theme.text, marginBottom: 8 },
  subheading: { fontSize: 16, color: theme.textMuted, marginBottom: 24, lineHeight: 24 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.cardRadius,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  label: { fontSize: 14, fontWeight: '500', color: theme.text, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
  },
  hint: { fontSize: 13, color: theme.textMuted, marginTop: 8 },
  errorMsg: { color: theme.error, marginTop: 12 },
  formFooter: { flexDirection: 'row', gap: 12, marginTop: 20, justifyContent: 'flex-end' },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cancelBtnText: { color: theme.textMuted, fontWeight: '500' },
  submitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: theme.accent,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontWeight: '600' },
});
