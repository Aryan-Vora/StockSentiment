import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';

const WEB_URL = process.env.EXPO_PUBLIC_STOCKSENTIMENT_URL || 'https://stock-sentiment-eosin.vercel.app/';

export default function App() {
  return (
    <View style={styles.container}>
      <WebView
        style={styles.webview}
        source={{ uri: WEB_URL }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#18181b" />
            <Text style={styles.loadingText}>Loading StockSentiment...</Text>
          </View>
        )}
        renderError={() => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Could not load StockSentiment</Text>
            <Text style={styles.errorSubText}>Check your connection, then try again.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8f7f2',
  },
  loadingText: {
    color: '#3f3f46',
    fontSize: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f7f2',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
