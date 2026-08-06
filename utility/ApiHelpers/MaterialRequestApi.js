import RNBlobUtil from 'react-native-blob-util';
import { mainUrl } from './StagingApis';

const StagApiUrl = `${mainUrl}api`;

export const getMaterialRequestDepartments = async (userToken, divname) => {
  const url = `${StagApiUrl}/material-request/departments?divname=${encodeURIComponent(
    divname,
  )}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status === 200) return response.json();
  throw new Error('departments failed: ' + response.status);
};

export const getMaterialRequestPlants = async (userToken, department) => {
  const url = `${StagApiUrl}/material-request/plants?department=${encodeURIComponent(
    department,
  )}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status === 200) return response.json();
  throw new Error('plants failed: ' + response.status);
};

export const getMaterialRequestEquipments = async (userToken, plant) => {
  const url = `${StagApiUrl}/material-request/equipments?plant=${encodeURIComponent(
    plant,
  )}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status === 200) return response.json();
  throw new Error('equipments failed: ' + response.status);
};

export const getMaterialRequestVehicles = async userToken => {
  const url = `${StagApiUrl}/material-request/vehicles`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status === 200) return response.json();
  throw new Error('vehicles failed: ' + response.status);
};

export const getMaterialRequestJobDetails = async userToken => {
  const url = `${StagApiUrl}/material-request/job-details`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status === 200) return response.json();
  throw new Error('job-details failed: ' + response.status);
};

export const cancelMaterialRequestDraft = async (userToken, mrNo) => {
  const url = `${StagApiUrl}/material-request/${mrNo}/cancel-draft`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status === 200) return response.json();
  throw new Error('cancel-draft failed: ' + response.status);
};

export const getMaterialRequestGenerate = async userToken => {
  const url = `${StagApiUrl}/material-request/generate`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status === 200) return response.json();
  throw new Error('generate failed: ' + response.status);
};

export const getMaterialRequestDivisions = async userToken => {
  const url = `${StagApiUrl}/material-request/divisions`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status === 200) return response.json();
  throw new Error('divisions failed: ' + response.status);
};

export const fetchMaterialRequestList = async (
  userToken,
  filters = {},
  page = 1,
) => {
  const url = `${StagApiUrl}/material-request/list?from_date=${
    filters.from_date ?? ''
  }&to_date=${filters.to_date ?? ''}&division=${filters.division ?? ''}&dept=${
    filters.dept ?? ''
  }&mrno=${filters.mrno ?? ''}&per_page=20&page=${page}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status !== 200) {
    throw new Error('material request list failed: ' + response.status);
  }
  const json = await response.json();
  return { items: json.data?.data ?? [], lastPage: json.data?.last_page ?? 1 };
};

export const submitMaterialRequest = async (userToken, payload) => {
  const url = `${StagApiUrl}/material-request/save`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
    body: JSON.stringify(payload),
  });
  if (response.status === 200 || response.status === 201)
    return response.json();
  const errText = await response.text();
  let message = errText;
  try {
    message = JSON.parse(errText)?.message ?? errText;
  } catch (e) {}
  throw new Error(message);
};

export const getMaterialRequestDetail = async (userToken, mrNo) => {
  const url = `${StagApiUrl}/material-request/${mrNo}/detail`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status === 200) return response.json();
  throw new Error('detail failed: ' + response.status);
};

export const getMaterialRequestAttachments = async (userToken, mrNo) => {
  const url = `${StagApiUrl}/material-request/${mrNo}/attachments`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status === 200) return response.json();
  throw new Error('attachments failed: ' + response.status);
};

export const updateMaterialRequest = async (userToken, mrNo, payload) => {
  const url = `${StagApiUrl}/material-request/${mrNo}/update`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
    body: JSON.stringify(payload),
  });
  if (response.status === 200 || response.status === 201)
    return response.json();
  const errText = await response.text();
  let message = errText;
  try {
    message = JSON.parse(errText)?.message ?? errText;
  } catch (e) {}
  throw new Error(message);
};

export const getMaterialRequestStocks = async (
  userToken,
  stockCode = '',
  stockName = '',
  page = 1,
) => {
  const url = `${StagApiUrl}/material-request/stocks?stock_code=${encodeURIComponent(
    stockCode,
  )}&stock_name=${encodeURIComponent(stockName)}&per_page=50&page=${page}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status === 200) return response.json();
  throw new Error('stocks failed: ' + response.status);
};

const getAttachmentMimeType = file => {
  if (file.type && file.type !== 'application/octet-stream') return file.type;
  const ext = file.name?.split('.').pop()?.toLowerCase();
  const map = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
  };
  return map[ext] ?? 'application/octet-stream';
};

export const deleteMaterialRequestAttachment = async (userToken, id) => {
  const url = `${StagApiUrl}/material-request/attachments/${id}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  if (response.status === 200 || response.status === 204) return true;
  const errText = await response.text();
  let message = errText;
  try { message = JSON.parse(errText)?.message ?? errText; } catch (e) {}
  throw new Error(message);
};

export const uploadMaterialRequestAttachment = async (
  userToken,
  mrNo,
  file,
) => {
  const url = `${StagApiUrl}/material-request/${mrNo}/attachments`;
  const mimeType = getAttachmentMimeType(file);
  const fileUri = file.uri.startsWith('file://')
    ? file.uri
    : `file://${file.uri}`;
  const filePath = fileUri.replace('file://', '');

  let stat;
  try {
    stat = await RNBlobUtil.fs.stat(filePath);
  } catch (e) {
    throw new Error(
      `${file.name} is no longer available on this device. Please remove and re-add it.`,
    );
  }
  if (!stat || Number(stat.size) <= 0) {
    throw new Error(
      `${file.name} appears to be empty. Please remove and re-add it.`,
    );
  }

  const res = await RNBlobUtil.fetch(
    'POST',
    url,
    { Authorization: 'Bearer ' + userToken },
    [
      {
        name: 'attachment',
        filename: file.name,
        type: mimeType,
        data: RNBlobUtil.wrap(filePath),
      },
      {
        name: 'description',
        data: file.description ?? '',
      },
    ],
  );

  const status = res.respInfo.status;
  if (status !== 200 && status !== 201) {
    throw new Error(`Upload failed for ${file.name}: ${status} ${res.data}`);
  }
  return true;
};
