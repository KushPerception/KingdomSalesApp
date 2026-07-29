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
  // Ref-based in-flight guard: React state (loading/footerLoading) updates
  // asynchronously, so FlatList's onEndReached can fire again before a
  // re-render lands and sneak past a state-only check, firing the same page
  // twice and appending duplicate items. This guard is synchronous, so it
  // protects every screen using this hook, regardless of item shape.
  const fetchingRef = useRef(false);
  // FlatList fires onEndReached spuriously on an empty list (content height
  // < viewport) — this can happen before the screen's first search() call
  // (e.g. while it's still awaiting the auth token from storage). Without
  // this guard, loadMore would fire a page-2 request with empty filters and
  // whatever token happens to be available yet, which can 401.
  const hasSearchedRef = useRef(false);

  const runFetch = async (filters, pageNo, reset) => {
    if (fetchingRef.current) {
      console.log(
        '[usePaginatedList] runFetch skipped, already in flight',
        JSON.stringify(
          {
            pageNo,
            reset,
          },
          null,
          2,
        ),
      );
      return;
    }
    fetchingRef.current = true;

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
      console.log(
        '[usePaginatedList] fetched page',
        JSON.stringify(
          {
            pageNo,
            reset,
            fetchedCount: items.length,
            lastPage,
          },
          null,
          2,
        ),
      );
      setList(prev => (reset ? items : [...prev, ...items]));
      setPage(pageNo);
      setNoMorePages(pageNo >= lastPage);
    } catch (e) {
      console.error(
        '[usePaginatedList] runFetch error',
        JSON.stringify({ pageNo, reset, message: e.message }),
      );
      setError(e);
    } finally {
      setLoading(false);
      setFooterLoading(false);
      fetchingRef.current = false;
    }
  };

  const search = filters => {
    hasSearchedRef.current = true;
    filtersRef.current = filters ?? {};
    return runFetch(filtersRef.current, 1, true);
  };

  const clear = defaultFilters => search(defaultFilters);

  const loadMore = () => {
    if (!hasSearchedRef.current) return;
    if (loading || footerLoading || noMorePages || fetchingRef.current) return;
    runFetch(filtersRef.current, page + 1, false);
  };

  return {
    list,
    loading,
    footerLoading,
    noMorePages,
    error,
    search,
    clear,
    loadMore,
  };
};

export default usePaginatedList;
