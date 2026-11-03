import { mainUrl } from './StagingApis';

const StagApiUrl = `${mainUrl}api`;

const buildQuery = params =>
  Object.entries(params)
    .filter(([, value]) => value !== '' && value != null)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

const parseJsonResponse = async response => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(
      `Non-JSON response (status ${response.status}): ${text.slice(0, 300)}`,
    );
  }
};

export const fetchQuotationList = async (userToken, filters, page = 1) => {
  const query = buildQuery({
    mrno: filters.mrno,
    stock_code: filters.stock_code,
    from_date: filters.from_date,
    to_date: filters.to_date,
    status: filters.status,
    per_page: 20,
    page,
  });
  const url = `${StagApiUrl}/enquiry/quotation-list?${query}`;
  console.log('[fetchQuotationList] url', url);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
  });
  const json = await parseJsonResponse(response);
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      'fetch quotation list failed: ' +
        response.status +
        ' ' +
        JSON.stringify(json),
    );
  }
  const items = (json.data?.data ?? []).sort((a, b) =>
    b.mr_no?.localeCompare(a.mr_no, undefined, { numeric: true }),
  );
  return { items, lastPage: json.data?.last_page ?? 1 };
};

export const approveEnquiry = async (userToken, eqNo, remarks, dtslno) => {
  const url = `${StagApiUrl}/enquiry/${dtslno}/approve`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
    body: JSON.stringify({ eqno: eqNo, approval_remarks: remarks }),
  });
  const json = await parseJsonResponse(response);
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      'approve enquiry failed: ' + response.status + ' ' + JSON.stringify(json),
    );
  }
  return json;
};
