# Purchase Manager / Purchase Order screens — restructure plan

## Context

`PurchaseManager.js` (PURCHASEMANAGER role) and `PurchaseOrderSceen.js` (CEO/MD
role) had grown into two heavy, duplicated files: `PurchaseManager.js` was
~915 lines with a `tab === 'quotation' ? urlA : urlB` conditional plus two
near-duplicate filter/search/pagination handler pairs, and `PurchaseOrderSceen.js`
was a ~250-line near-clone of PurchaseManager's "Purchase Order" tab. Root
cause: no shared API layer (all `fetch()`/URL-building/token-retrieval was
inlined directly in components) and no shared list component for the two
screens to reuse.

Goal: remove the duplication and the inline URL branching via (1) a proper
Purchase Order / Enquiry API layer, and (2) shared, reusable Purchase Order
and Quotation list components that both screens render.

## Status: done ✅

### 1. API layer
- `utility/ApiHelpers/PurchaseOrderApi.js` — `fetchPurchaseOrderList`,
  `approvePurchaseOrder`, `rejectPurchaseOrder`.
- `utility/ApiHelpers/EnquiryApi.js` — `fetchQuotationList`, `approveEnquiry`.
- Both follow the throw-on-failure convention (matching `submitMaterialRequest`
  in `StagingApis.js`), return `{items, lastPage}` for list calls, and take
  `userToken` as a parameter rather than reading `AsyncStorage` internally.
- `StagingApis.js` itself is untouched — these are additive sibling files.

### 2. Shared pagination hook
- `hooks/usePaginatedList.js` (new top-level `hooks/` folder — first custom
  hook in this codebase).
- `usePaginatedList({fetchPage})` → `{list, loading, footerLoading,
  noMorePages, error, search(filters), clear(defaultFilters), loadMore()}`.
- Knows nothing about PO vs. EQ filter shapes — each consumer binds its own
  endpoint + token via a `fetchPage` closure.

### 3. Shared FilterBar
- `Screens/CommonComponents/FilterBar.js` — moved out of the old local
  component inside `PurchaseManager.js`, unchanged behavior, now consumed by
  both list components below instead of being hand-duplicated.

### 4. Shared list components
- `Screens/MainComponents/PurchaseManager/PurchaseOrderList.js` — owns PO
  filter state, the PO bottom sheet, approve/reject modal + handler, and the
  paginated list. Props: just `navigation`.
- `Screens/MainComponents/PurchaseManager/QuotationList.js` — same shape for
  the quotation tab (also owns `expandedIndex`/accordion state, which resets
  for free on tab switch since the component fully unmounts/remounts).

### 5. Screens thinned down to shells
- `PurchaseManager.js`: 915 → 91 lines. Owns only `activeTab` state, header,
  tab bar, logout. Renders `<QuotationList/>` or `<PurchaseOrderList/>`.
- `PurchaseOrderSceen.js`: ~620 → 27 lines. Owns only header/logout, renders
  `<PurchaseOrderList/>`.
- Both screens now share the exact same `PurchaseOrderList` — no more
  duplicated PO logic between the CEO/MD screen and the Purchase Manager's PO
  tab.

### Verified so far
- Every new/changed file compiles via the project's actual babel preset
  (`@react-native/babel-preset`).
- `eslint` clean except one `react-hooks/exhaustive-deps` warning in both new
  list components (mount-only `useEffect(() => search(...), [])`) — confirmed
  this exact pattern already exists and is accepted in `MaterialRequestList.js`
  today, so it's consistent with the codebase, not a new problem.

## Status: remaining / not done ⏳

- **Manual on-device verification** — this repo has no test suite covering
  these screens (only the default RN `__tests__/App.test.js` smoke test), and
  no simulator/device was run in this session. Before merging, manually
  exercise:
  - CEO/MD (`PurchaseOrderScreen`): list loads, search by
    PONO/Department/Supplier, date range, status chips, Clear, scroll-to-end
    load-more, all 7 bottom-sheet buttons, Approve + Reject, logout.
  - PURCHASEMANAGER (`PurchaseManager`): both tabs individually (same
    checklist as above for the PO tab, plus quotation search/expand/Approve
    for the quotation tab), switching tabs back and forth (confirm no state
    leaks, `initialTab` route param still respected).
  - Simulate a failed request and confirm the new throw-based API errors are
    actually surfaced somewhere, not silently swallowed.
- **Optional filename fix** — `PurchaseOrderSceen.js` has an on-disk typo
  (missing the second "r" in "Screen"). Rename to `PurchaseOrderScreen.js` and
  update the one import line in `Navigation/AppNavigation.js`. Deliberately
  left alone so it doesn't muddy the review of the logic refactor — do as its
  own isolated commit whenever convenient.
- **Future candidate, out of scope for this pass** — `CostController.js` and
  `SupplierPickerScreen.js` (COSTCONTROLLER role) already duplicate the exact
  same pagination bookkeeping (`page`/`noMorePages`/`footerLoading`,
  `setNoMorePages(pageNo >= lastPage)`, load-more guard) that
  `usePaginatedList` now centralizes. Migrating them to the hook would remove
  more duplication, but wasn't part of the original ask (scoped to Purchase
  Manager / Purchase Order screens only).
- **Unrelated pre-existing note** — `Screens/MainComponents/PurchaseManager/MRDetailScreen.js`
  is not registered in `AppNavigation.js` and not referenced anywhere; appears
  to be dead/orphaned code from an earlier iteration (flagged in an earlier
  session, not touched by this refactor).
