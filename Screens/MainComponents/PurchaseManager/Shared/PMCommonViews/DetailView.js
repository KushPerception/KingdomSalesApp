import React from 'react';
import { ScrollView, View } from 'react-native';
import { ArraySections, MR_HIDDEN_FIELDS, Row, humanizeKey, styles } from './shared';

// Renders every key/value from the data object (used when the caller didn't
// ask for one of the more specific detail layouts below).
const DetailView = ({ data }) => {
  if (!data) return null;

  const fields = Object.entries(data).filter(
    ([k, v]) => !Array.isArray(v) && typeof v !== 'object' && !MR_HIDDEN_FIELDS.has(k),
  );
  const arrays = Object.entries(data).filter(([, v]) => Array.isArray(v));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.paddedCard}>
        {fields.map(([key, value]) => (
          <Row key={key} label={humanizeKey(key)} value={value} />
        ))}
      </View>
      <ArraySections arrays={arrays} />
    </ScrollView>
  );
};

export default DetailView;
