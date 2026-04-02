import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getGroups, getEvents } from '../api/client';
import { theme } from '../theme';

export default function Home({ navigation }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        const [groupsResponse, eventsResponse] = await Promise.all([getGroups(), getEvents()]);
        if (cancelled) return;
        setGroups(groupsResponse.groups || []);
        setEvents(eventsResponse.events || []);
      } catch (err) {
        if (!cancelled) setError('Unable to load groups and events.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (user) fetchData();
    return () => { cancelled = true; };
  }, [user]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>Welcome back, {firstName}</Text>
        <Text style={styles.welcomeSubtitle}>
          Here’s an overview of your groups and upcoming events.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your groups</Text>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
              onPress={() => navigation.navigate('JoinGroup')}
            >
              <Text style={styles.btnSecondaryText}>Join group</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <Text style={styles.btnPrimaryText}>Create group</Text>
            </Pressable>
          </View>
        </View>

        {loading && (
          <View style={styles.emptyState}>
            <ActivityIndicator color={theme.accent} />
            <Text style={styles.emptyText}>Loading…</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyError}>{error}</Text>
          </View>
        )}

        {!loading && !error && groups.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Groups you join or create will appear here. Join with a code or create a group to get started.
            </Text>
          </View>
        )}

        {!loading && !error && groups.length > 0 && (
          <View style={styles.list}>
            {groups.map((group) => (
              <Pressable
                key={group._id}
                style={({ pressed }) => [styles.listItem, pressed && styles.listItemPressed]}
                onPress={() => navigation.navigate('Group', { groupId: group._id })}
              >
                <Text style={styles.itemTitle}>{group.name}</Text>
                {!!group.description && (
                  <Text style={styles.itemMeta}>{group.description}</Text>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitleStandalone}>Upcoming events</Text>

        {!loading && events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Events from your groups will show up here. Create an event in a group to see it.
            </Text>
          </View>
        ) : null}

        {!loading && events.length > 0 && (
          <View style={styles.list}>
            {events.map((event) => (
              <Pressable
                key={event._id}
                style={({ pressed }) => [styles.listItem, pressed && styles.listItemPressed]}
                onPress={() => navigation.navigate('Event', { eventId: event._id })}
              >
                <Text style={styles.itemTitle}>{event.title}</Text>
                <Text style={styles.itemMeta}>
                  {new Date(event.startAt).toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
                {(event.groupId?.name ?? event.groupName) ? (
                  <Text style={styles.itemMeta}>
                    Group: {event.groupId?.name ?? event.groupName}
                  </Text>
                ) : null}
                {!!event.description && (
                  <Text style={styles.itemMeta}>{event.description}</Text>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  pageContent: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 672,
    alignSelf: 'center',
    width: '100%',
  },
  welcome: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: theme.text,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.textMuted,
    lineHeight: 24,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.cardRadius,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    borderLeftWidth: 3,
    borderLeftColor: theme.accent,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  sectionTitleStandalone: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  btnPrimary: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: theme.accent,
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnPrimaryPressed: {
    backgroundColor: theme.accentHover,
  },
  btnSecondaryText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textMuted,
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  list: {
    gap: 10,
  },
  listItem: {
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
  },
  listItemPressed: {
    borderColor: theme.accent,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  itemMeta: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 4,
  },
  emptyState: {
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.bgAlt,
  },
  emptyText: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyError: {
    fontSize: 15,
    color: theme.error,
    fontWeight: '500',
    textAlign: 'center',
  },
});
