import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This is a dummy Marker component for web.
// It renders nothing, as Markers are part of the map.
export const Marker = (props: any): React.ReactElement | null => {
  return null;
};

// This is a dummy MapView component for web.
// It renders a placeholder instead of a real map.
const DummyMapView = (props: any): React.ReactElement => {
  const containerStyle = StyleSheet.flatten([props.style, styles.container]);

  return (
    <View style={containerStyle}>
      <Text style={styles.text}>Map is not available on web.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#c0c0c0',
  },
  text: {
    color: '#666',
  },
});

export default DummyMapView;
