import { mainUrl } from './StagingApis';

const StagApiUrl = `${mainUrl}api`;

const buildQuery = params =>
  Object.entries(params)
    .map(([key, value]) => `${key}=${value ?? ''}`)
    .join('&');

export const fetchPurchaseOrderList = async (userToken, filters, page = 1) => {
  const query = buildQuery({
    pono: filters.pono,
    department: filters.department,
    supname: filters.supname,
    from_date: filters.from_date,
    to_date: filters.to_date,
    approved_only: filters.approved_only,
    rejected_only: filters.rejected_only,
    pending_only: filters.pending_only,
    per_page: 20,
    page,
  });
  const url = `${StagApiUrl}/purchase-order/list?${query}`;
  console.log('[PurchaseOrderApi] Request URL:', url);
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + userToken },
  });
  const json = await response.json();
  console.log('[PurchaseOrderApi] fetchPurchaseOrderList response JSON:', JSON.stringify(json, null, 2));
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      'fetch PO list failed: ' + response.status + ' ' + JSON.stringify(json),
    );
  }
  return { items: json.data?.data ?? [], lastPage: json.data?.last_page ?? 1 };
};

const postPOAction = async (userToken, poNo, mode, remarks) => {
  const url = `${StagApiUrl}/purchase-order/${poNo}/${mode}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userToken,
    },
    body: JSON.stringify({ remarks }),
  });
  const json = await response.json();
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      `${mode} PO failed: ` + response.status + ' ' + JSON.stringify(json),
    );
  }
  return json;
};

export const approvePurchaseOrder = (userToken, poNo, remarks) =>
  postPOAction(userToken, poNo, 'approve', remarks);

export const rejectPurchaseOrder = (userToken, poNo, remarks) =>
  postPOAction(userToken, poNo, 'reject', remarks);
