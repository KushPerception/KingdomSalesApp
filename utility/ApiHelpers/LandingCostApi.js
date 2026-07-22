import { mainUrl } from './StagingApis';

const StagApiUrl = `${mainUrl}api`;

const buildQuery = params =>
  Object.entries(params)
    .map(([key, value]) => `${key}=${value ?? ''}`)
    .join('&');

export const fetchLandingCostList = async (userToken, filters = {}, page = 1) => {
  const query = buildQuery({
    from_date: filters.from_date,
    to_date: filters.to_date,
    lcno: filters.lcno,
    supname: filters.supname,
    pono: filters.pono,
    posted: filters.posted,
    per_page: 20,
    page,
  });
  const url = `${StagApiUrl}/landing-cost/list?${query}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + userToken },
  });
  const json = await response.json();
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      'fetch landing cost list failed: ' + response.status + ' ' + JSON.stringify(json),
    );
  }
  return { items: json.data?.data ?? [], lastPage: json.data?.last_page ?? 1 };
};

export const fetchSupplierList = async (userToken, keyword = '', page = 1) => {
  const query = buildQuery({
    search: encodeURIComponent(keyword ?? ''),
    per_page: 20,
    page,
  });
  const url = `${StagApiUrl}/landing-cost/suppliers?${query}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json', Authorization: 'Bearer ' + userToken },
  });
  const json = await response.json();
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      'fetch supplier list failed: ' + response.status + ' ' + JSON.stringify(json),
    );
  }
  return {
    items: json.data?.data ?? json.data ?? [],
    lastPage: json.data?.last_page ?? 1,
  };
};
