import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { updateMe, deleteMe, uploadAvatar, getToken, resolveApiUrl } from '../api/client';
import { getAvatarColor } from '../utils/avatar';
import { theme } from '../theme';

export default function Settings() {
  const { user, setAuth, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleStartEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setSaveMsg(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(user?.name || '');
    setEmail(user?.email || '');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await updateMe({ name, email });
      const token = await getToken();
      await setAuth(token, res.user);
      setSaveMsg({ ok: true, text: 'Profile saved successfully.' });
      setIsEditing(false);
    } catch (err) {
      setSaveMsg({ ok: false, text: err.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setPhotoError('Photo library permission is required.');
      return;
    }
    setPhotoError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setUploadingPhoto(true);
    try {
      const mime = asset.mimeType || 'image/jpeg';
      const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : mime.includes('gif') ? 'gif' : 'jpg';
      const res = await uploadAvatar(asset.uri, mime, `avatar.${ext}`);
      const token = await getToken();
      await setAuth(token, res.user);
    } catch (err) {
      setPhotoError(err.message || 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMe();
      logout();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to delete account.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const seed = user?.id ?? user?._id ?? user?.email ?? '?';
  const fallback = getAvatarColor(String(seed));

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <Text style={styles.pageTitle}>Settings</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Profile</Text>
          {!isEditing && (
            <Pressable onPress={handleStartEdit} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.cardDesc}>
          Manage your profile name, email, and photo. Tap Edit to change name and email.
        </Text>

        {!isEditing ? (
          <View>
            <View style={styles.avatarBlock}>
              {user?.photoUrl ? (
                <Image source={{ uri: resolveApiUrl(user.photoUrl) }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: fallback.background }]}>
                  <Text style={[styles.avatarLetter, { color: fallback.color }]}>
                    {(user?.name || user?.email || '?')[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
              <Pressable
                style={[styles.photoBtn, uploadingPhoto && styles.photoBtnDisabled]}
                onPress={pickImage}
                disabled={uploadingPhoto}
              >
                <Text style={styles.photoBtnText}>{uploadingPhoto ? 'Uploading…' : 'Change photo'}</Text>
              </Pressable>
              {photoError ? <Text style={styles.msgError}>{photoError}</Text> : null}
            </View>

            <View style={styles.profile}>
              <Text style={styles.dt}>Name</Text>
              <Text style={styles.dd}>{user?.name || '—'}</Text>
              <Text style={styles.dt}>Email</Text>
              <Text style={styles.dd}>{user?.email || '—'}</Text>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.textFaint}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.textFaint}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {saveMsg ? (
              <Text style={saveMsg.ok ? styles.msgSuccess : styles.msgError}>{saveMsg.text}</Text>
            ) : null}
            <View style={styles.formFooter}>
              <Pressable style={styles.ghostBtn} onPress={handleCancelEdit} disabled={saving}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.cardTitle}>Danger zone</Text>
        <Text style={styles.cardDesc}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </Text>
        {!confirmDelete ? (
          <Pressable style={styles.dangerBtn} onPress={() => setConfirmDelete(true)}>
            <Text style={styles.dangerBtnText}>Delete my account</Text>
          </Pressable>
        ) : (
          <View>
            <Text style={styles.confirmText}>
              Are you absolutely sure? Your account will be deleted immediately.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                style={[styles.dangerBtn, deleting && styles.photoBtnDisabled]}
                onPress={handleDelete}
                disabled={deleting}
              >
                <Text style={styles.dangerBtnText}>
                  {deleting ? 'Deleting…' : 'Yes, delete my account'}
                </Text>
              </Pressable>
              <Pressable style={styles.ghostBtn} onPress={() => setConfirmDelete(false)} disabled={deleting}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.bg },
  pageContent: { padding: 20, paddingBottom: 40 },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 20,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.cardRadius,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  dangerCard: {
    borderColor: 'rgba(220, 38, 38, 0.35)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  cardDesc: {
    fontSize: 15,
    color: theme.textMuted,
    marginBottom: 16,
    lineHeight: 22,
  },
  editBtn: { padding: 8 },
  editBtnText: { color: theme.accent, fontWeight: '600', fontSize: 15 },
  avatarBlock: { alignItems: 'flex-start', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: { fontSize: 32, fontWeight: '600' },
  photoBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  photoBtnDisabled: { opacity: 0.6 },
  photoBtnText: { color: theme.text, fontWeight: '500' },
  profile: { gap: 4 },
  dt: { fontSize: 13, color: theme.textMuted, marginTop: 10 },
  dd: { fontSize: 16, color: theme.text, fontWeight: '500' },
  label: { fontSize: 14, fontWeight: '500', color: theme.text, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.surface,
  },
  formFooter: { flexDirection: 'row', gap: 12, marginTop: 16 },
  ghostBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  ghostBtnText: { color: theme.textMuted, fontWeight: '500' },
  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: theme.accent,
  },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  msgSuccess: { color: theme.success, marginTop: 8 },
  msgError: { color: theme.error, marginTop: 8 },
  dangerBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.error,
  },
  dangerBtnText: { color: '#fff', fontWeight: '600' },
  confirmText: { marginBottom: 12, color: theme.textMuted },
  confirmActions: { gap: 10 },
});
