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

- **Manual on-device verification** — done. This repo still has no test suite
  covering these screens (only the default RN `__tests__/App.test.js` smoke
  test), so the checklist below was exercised manually rather than proven by
  automated tests:
  - CEO/MD (`PurchaseOrderScreen`): list loads, search by
    PONO/Department/Supplier, date range, status chips, Clear, scroll-to-end
    load-more, all 7 bottom-sheet buttons, Approve + Reject, logout.
  - PURCHASEMANAGER (`PurchaseManager`): both tabs individually (same
    checklist as above for the PO tab, plus quotation search/expand/Approve
    for the quotation tab), switching tabs back and forth (confirm no state
    leaks, `initialTab` route param still respected).
  - Simulate a failed request and confirm the new throw-based API errors are
    actually surfaced somewhere, not silently swallowed.
- **Unrelated pre-existing note** — `Screens/MainComponents/PurchaseManager/MRDetailScreen.js`
  is not registered in `AppNavigation.js` and not referenced anywhere; appears
  to be dead/orphaned code from an earlier iteration (flagged in an earlier
  session, not touched by this refactor).

## Status: done in a follow-up pass ✅

- **Filename fix** — `PurchaseOrderSceen.js` renamed to `PurchaseOrderScreen.js`
  (on-disk typo fix), with the import in `Navigation/AppNavigation.js` updated
  to match. Landed as its own isolated commit.
- **CostController / SupplierPickerScreen migration** — both screens
  (COSTCONTROLLER role) duplicated the same pagination bookkeeping
  (`page`/`noMorePages`/`footerLoading`, `setNoMorePages(pageNo >= lastPage)`,
  load-more guard) that `usePaginatedList` already centralizes for the
  Purchase Order / Quotation lists. Migrated both to the hook:
  - `utility/ApiHelpers/LandingCostApi.js` — new sibling API file
    (`fetchLandingCostList`, `fetchSupplierList`), following the same
    throw-on-failure / `{items, lastPage}` / `userToken`-as-parameter
    convention as `PurchaseOrderApi.js`.
  - `CostController.js` — `useFocusEffect` now just refreshes the token and
    calls `search({})`; `handleLoadMore` replaced by the hook's `loadMore`.
  - `SupplierPickerScreen.js` — same shape, with the search keyword passed
    straight through as the hook's `filters` argument (`fetchSupplierList`
    treats it as the `search` query param rather than an object).
  - Stripped the ad-hoc `console.log`/`console.error` debug logging in both
    screens while touching them, matching the cleanup already done to
    `PurchaseOrderList.js`/`QuotationList.js`/`EnquiryApi.js`/`PurchaseOrderApi.js`.
  - Verified via `eslint` (clean) and a direct `@babel/core` compile with the
    project's `@react-native/babel-preset` (all three files parse); no
    on-device verification was performed for this follow-up pass.

## Status: Material Request restructure (same pattern, follow-up pass) ✅

Applied the same restructure pattern to `Screens/MainComponents/MaterialRequest/`.
Unlike the Purchase Manager case, the API calls here weren't inlined in
components — they already lived in `StagingApis.js` as ~14 loosely-related
functions. So this pass *moved* them out rather than writing new ones:

- **New `utility/ApiHelpers/MaterialRequestApi.js`** — all
  `getMaterialRequest*`/`submitMaterialRequest`/`updateMaterialRequest`
  functions moved out of `StagingApis.js` (which shrank accordingly),
  console.log/console.error debug noise stripped.
  - `getMaterialRequestList` was the worst offender in either restructure —
    it took `setList`/`setPage`/`setFooterLoading`/`setNoMorePage`/`setLoading`
    React state setters as parameters, coupling the API layer directly to one
    component's state shape. Redesigned as `fetchMaterialRequestList(userToken,
    filters, page)` → `{items, lastPage}`, matching `fetchPurchaseOrderList`'s
    contract so `MaterialRequestList.js` could adopt `usePaginatedList`.
  - Added `uploadMaterialRequestAttachment(userToken, mrNo, file)`, extracting
    the inline `RNBlobUtil.fetch` multipart upload + MIME-type lookup that
    previously lived in `MaterialRequestAttachment.js`.
  - Incidental fix: `MRDetailScreen.js` (the orphaned/unregistered screen
    noted above) imported two of the moved functions from `StagingApis.js` —
    repointed to `MaterialRequestApi.js` so it doesn't silently break; its
    logic was not otherwise touched.
- **`MaterialRequestList.js`** — adopted `usePaginatedList`, same shape as
  `PurchaseOrderList.js`. Preserved one pre-existing quirk as-is: changing
  `fromDate`/`toDate` alone doesn't trigger a refetch, only the debounced
  `[keyword, searchBy]` effect does — not fixed in this pass, worth a look
  separately.
- **Renamed the numbered screens** to describe what each step does — this
  also meant updating the React Navigation route names (`Stack.Screen name=`)
  and every `navigate()` call site referencing them by string, a bigger
  blast radius than the `PurchaseOrderSceen.js` typo fix, done with explicit
  confirmation:
  - `MaterialRequest1.js` → `MaterialRequestForm.js` (route
    `"MaterialRequestForm"`) — division/dept/plant/equipment/vehicle/priority form.
  - `MaterialRequest2.js` → `MaterialRequestItems.js` (route
    `"MaterialRequestItems"`) — stock item qty/remarks entry.
  - `MaterialRequest3.js` → `MaterialRequestStockPicker.js` (route
    `"MaterialRequestStockPicker"`) — stock search/picker.
  - `MaterialRequestAttachment.js` and `MaterialRequestList.js` kept their
    names (already descriptive).
- Stripped debug `console.log`/`console.error` noise throughout all 5 screens
  (kept the user-facing `Alert.alert` error handling as-is).
- Verified via `eslint` (only pre-existing warnings/errors remain, confirmed
  identical against the pre-change files) and a direct `@babel/core` compile
  with `@react-native/babel-preset` (all changed files parse); no on-device
  verification was performed for this pass — before merging, manually
  exercise: MR list load/search/date-range/load-more, new MR create flow
  (form → items → stock picker → attachments → submit), edit MR flow, and
  attachment upload/failure paths.
