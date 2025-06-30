import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={styles.container}>
      <WebView
        style={styles.webview}
        source={{ uri: 'https://stock-sentiment-eosin.vercel.app/' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onHttpError={() => {
          setError(true);
          setLoading(false);
        }}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Loading...</Text>
          </View>
        )}
        renderError={() => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load page</Text>
            <Text style={styles.errorSubText}>Check your internet connection</Text>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
