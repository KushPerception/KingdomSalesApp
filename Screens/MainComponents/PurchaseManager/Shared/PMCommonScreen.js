import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import HeaderComponent from '../../../CommonComponents/Header';
import AttachmentsList from '../../../CommonComponents/AttachmentsList';
import { primaryColor } from '../../../../utility/colors';
import { fonts } from '../../../../utility/GlobalStyles';
import PODetailView from './PMCommonViews/PODetailView';
import EnqDetailView from './PMCommonViews/EnqDetailView';
import DetailView from './PMCommonViews/DetailView';
import MrDetailsView from './PMCommonViews/MrDetailsView';
import EqDetailsView from './PMCommonViews/EqDetailsView';

// Generic screen driven entirely by navigation params: fetches `apiUrl` and
// picks which view renders the result based on which `is*Detail`/`is*Details`
// flag was passed. With none of those flags set, the response is treated as
// an attachment list.
const PMCommonScreen = props => {
  const {
    title,
    apiUrl,
    isDetail,
    isEnqDetail,
    isEqDetails,
    isMrDetails,
    isPODetail,
  } = props.route?.params ?? {};

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        props.navigation.goBack();
        return true;
      });
      return () => sub.remove();
    }, [props.navigation]),
  );

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + token,
          },
        });
        const json = await res.json();

        if (res.status !== 200) {
          throw new Error(json?.message ?? 'Request failed: ' + res.status);
        }

        setData(
          isPODetail || isDetail || isEnqDetail || isEqDetails || isMrDetails
            ? json.data
            : json.data ?? [],
        );
      } catch (e) {
        console.error('[PMCommonScreen] error =', e.message);
        setError(e.message ?? 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [apiUrl]);

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle
        Title={title ?? 'Details'}
        onBackPress={() => props.navigation.goBack()}
      />
      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={primaryColor}
        />
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : isPODetail ? (
        <PODetailView data={data} />
      ) : isMrDetails ? (
        <MrDetailsView data={data} navigation={props.navigation} />
      ) : isEqDetails ? (
        <EqDetailsView data={data} />
      ) : isEnqDetail ? (
        <EnqDetailView data={data} />
      ) : isDetail ? (
        <DetailView data={data} />
      ) : (
        <AttachmentsList data={data} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: {
    color: '#cc0000',
    fontFamily: fonts.Lato_Regular,
    textAlign: 'center',
    padding: 20,
  },
});

export default PMCommonScreen;
