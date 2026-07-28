import React from 'react';
import { ScrollView, View } from 'react-native';
import { ArraySections, Row, styles } from './shared';

const EQ_DETAIL_FIELDS = [
  { key: 'EQNO', label: 'EQ No' },
  { key: 'ENQDATE', label: 'ENQ Date' },
  { key: 'SUPNAME', label: 'Supplier Name' },
  { key: 'added_by', label: 'Added By' },
  { key: 'ADDDATETIME', label: 'Add Date Time' },
  { key: 'ENQTYPE', label: 'ENQ Type' },
];

// Enquiry detail — shows only the whitelisted fields above, plus any nested
// array fields (items, etc.) as tables.
const EnqDetailView = ({ data }) => {
  if (!data) return null;
  const arrays = Object.entries(data).filter(([, v]) => Array.isArray(v));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.paddedCard}>
        {EQ_DETAIL_FIELDS.map(({ key, label }) =>
          data[key] != null && data[key] !== '' ? (
            <Row key={key} label={label} value={data[key]} />
          ) : null,
        )}
      </View>
      <ArraySections arrays={arrays} />
    </ScrollView>
  );
};

export default EnqDetailView;
