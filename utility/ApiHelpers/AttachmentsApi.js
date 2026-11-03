import AsyncStorage from '@react-native-async-storage/async-storage';
import { mainUrl } from './StagingApis';

// Every module that has attachments (material-request, purchase-order,
// enquiry) exposes the same two-endpoint shape: a lightweight list endpoint
// returning metadata only, and this per-attachment endpoint returning just
// that one file's Base64 content — fetched lazily, only for the attachment
// actually being shown/opened.
export const getAttachmentFile = async (attachmentModule, slno) => {
  const token = await AsyncStorage.getItem('access_token');
  const url = `${mainUrl}api/${attachmentModule}/attachments/${slno}/file`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
    },
  });
  if (response.status !== 200) {
    throw new Error('attachment file failed: ' + response.status);
  }
  const json = await response.json();
  return json?.data?.ATTACHFILE ?? null;
};

// Attachment list URLs look like `.../api/{module}/{id}/attachments`; the
// file endpoint for the same attachment needs just the module segment.
export const moduleFromAttachmentsApiUrl = apiUrl => {
  const match = apiUrl?.match(/\/api\/([^/]+)\//);
  return match?.[1] ?? null;
};
