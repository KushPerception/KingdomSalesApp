import { useRef, useState } from 'react';

// fetchPage: (filters, page) => Promise<{items: any[], lastPage: number}>
const usePaginatedList = ({ fetchPage }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const [noMorePages, setNoMorePages] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const filtersRef = useRef({});

  const runFetch = async (filters, pageNo, reset) => {
    if (reset) {
      setLoading(true);
      setList([]);
      setNoMorePages(false);
    } else {
      setFooterLoading(true);
    }
    setError(null);
    try {
      const { items, lastPage } = await fetchPage(filters, pageNo);
      setList(prev => (reset ? items : [...prev, ...items]));
      setPage(pageNo);
      setNoMorePages(pageNo >= lastPage);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
      setFooterLoading(false);
    }
  };

  const search = filters => {
    filtersRef.current = filters ?? {};
    return runFetch(filtersRef.current, 1, true);
  };

  const clear = defaultFilters => search(defaultFilters);

  const loadMore = () => {
    if (loading || footerLoading || noMorePages) return;
    runFetch(filtersRef.current, page + 1, false);
  };

  return { list, loading, footerLoading, noMorePages, error, search, clear, loadMore };
};

export default usePaginatedList;
