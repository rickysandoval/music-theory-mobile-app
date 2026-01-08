import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Text, useTheme } from '@/src/components/ui';

export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text variant="titleLarge">This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text variant="bodyMedium" style={{ color: theme.primary }}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
