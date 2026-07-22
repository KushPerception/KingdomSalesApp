import { mainUrl } from './StagingApis';

const StagApiUrl = `${mainUrl}api`;

const buildQuery = params =>
  Object.entries(params)
    .filter(([, value]) => value !== '' && value != null)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

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
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + userToken },
  });
  const json = await response.json();
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      'fetch quotation list failed: ' +
        response.status +
        ' ' +
        JSON.stringify(json),
    );
  }
  const items = (json.data?.data ?? []).sort((a, b) => b.mr_no?.localeCompare(a.mr_no, undefined, { numeric: true }));
  return { items, lastPage: json.data?.last_page ?? 1 };
};

export const approveEnquiry = async (userToken, eqNo, remarks, dtslno) => {
  const url = `${StagApiUrl}/enquiry/${dtslno}/approve`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
    body: JSON.stringify({eqno:eqNo, approval_remarks: remarks }),
  });
  const json = await response.json();
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      'approve enquiry failed: ' + response.status + ' ' + JSON.stringify(json),
    );
  }
  return json;
};
