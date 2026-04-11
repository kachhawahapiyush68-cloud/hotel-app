src
+---api
|       authApi.ts
|       billApi.ts                 // UPDATE
|       bookingApi.ts
|       cashsheetApi.ts            // NEW
|       categoryApi.ts
|       companyApi.ts
|       guestApi.ts
|       httpClient.ts
|       kotApi.ts
|       ledgerApi.ts
|       postingApi.ts              // UPDATE
|       paymentApi.ts              // NEW
|       productApi.ts
|       roomApi.ts
|       types.ts                   // UPDATE
|       userApi.ts
|       voucherApi.ts
|
+---config
|       env.ts
|       theme.ts
|
+---modules
|   +---auth
|   |       api.ts
|   |       LoginScreen.tsx
|   |       RegisterScreen.tsx
|   |       store.ts
|   |
|   +---bill
|   |   |   api.ts                 // UPDATE
|   |   |   BillCheckoutScreen.tsx // NEW
|   |   |   BillDetailScreen.tsx   // UPDATE
|   |   |   BillFromKotScreen.tsx
|   |   |   BillListScreen.tsx     // UPDATE
|   |   |   store.ts
|   |   |
|   |   \---components
|   |           BillItemRow.tsx
|   |           BillPaymentPanel.tsx // NEW optional
|   |
|   +---booking
|   |   |   api.ts
|   |   |   ArrivalListScreen.tsx
|   |   |   BookingListScreen.tsx
|   |   |   QuickReservationScreen.tsx
|   |   |   store.ts
|   |   |
|   |   \---components
|   |           ArrivalCard.tsx
|   |           BookingDetailsHeader.tsx
|   |           BookingForm.tsx
|   |           BookingListCard.tsx
|   |           CalendarRangePicker.tsx
|   |           DateRangeFilter.tsx
|   |           GuestPicker.tsx
|   |           RoomPicker.tsx
|   |
|   +---cashsheet                  // NEW
|   |   |   api.ts
|   |   |   CashsheetScreen.tsx
|   |   |
|   |   \---components
|   |           CashSummaryCard.tsx
|   |
|   +---dashboard
|   |   |   api.ts
|   |   |   DashboardScreen.tsx
|   |   |
|   |   \---components
|   |           InfoCard.tsx
|   |           StatCard.tsx
|   |           SummaryRow.tsx
|   |
|   +---folio
|   |       api.ts
|   |       FolioDetailScreen.tsx
|   |       FolioListScreen.tsx
|   |
|   +---kot
|   |   |   api.ts
|   |   |   KotEntryScreen.tsx
|   |   |   KotListScreen.tsx
|   |   |
|   |   \---components
|   |           KotItemRow.tsx
|   |
|   +---masters
|   |   |   api.ts
|   |   |   CategoryListScreen.tsx
|   |   |   CompanyEditScreen.tsx
|   |   |   CompanyListScreen.tsx
|   |   |   GuestListScreen.tsx
|   |   |   LedgerListScreen.tsx
|   |   |   LedgerStatementScreen.tsx // if already used in nav, keep/create
|   |   |   MastersScreen.tsx
|   |   |   ProductListScreen.tsx
|   |   |   RoomListScreen.tsx
|   |   |   store.ts
|   |   |   TaxGroupListScreen.tsx
|   |   |
|   |   \---components
|   |           CategoryForm.tsx
|   |           CategoryPicker.tsx
|   |           CompanyForm.tsx
|   |           LedgerForm.tsx
|   |           ProductForm.tsx
|   |           RoomForm.tsx
|   |           RoomPicker.tsx
|   |           TaxGroupForm.tsx
|   |
|   +---notification
|   |   |   api.ts
|   |   |   NotificationListScreen.tsx
|   |   |
|   |   \---components
|   |           NotificationItem.tsx
|   |
|   +---payment                    // NEW
|   |   |   api.ts
|   |   |   PaymentListScreen.tsx
|   |   |
|   |   \---components
|   |           PaymentCard.tsx
|   |
|   +---settings
|   |       SettingsScreen.tsx
|   |
|   +---stayView
|   |    |  AddChargeScreen.tsx
|   |    |  InHouseListScreen.tsx
|   |    |  PendingBillingListScreen.tsx // NEW if nav uses it
|   |    |  StayViewScreen.tsx           // UPDATE
|   |    |
|   |    \---components
|   |            PostingEditModal.tsx
|   |            PostingList.tsx         // UPDATE
|   |
|   +---users
|   |       api.ts
|   |       UserEditScreen.tsx
|   |       UserListScreen.tsx
|   |
|   \---voucher
|           api.ts
|           VoucherDetailScreen.tsx   // if nav uses it, keep/create
|           VoucherEntryScreen.tsx
|           VoucherListScreen.tsx
|
+---navigation
|       AuthStack.tsx
|       MainTabs.tsx                 // UPDATE
|       RootNavigator.tsx            // UPDATE
|
+---shared
|   +---components
|   |       AppButton.tsx
|   |       AppInput.tsx
|   |       Card.tsx
|   |       Loader.tsx
|   |       Pill.tsx
|   |       SectionTitle.tsx
|   |       SelectModal.tsx
|   |
|   +---hooks
|   |       useAuthGuard.ts
|   |
|   \---utils
|           date.ts
|           number.ts
|           role.ts
|           validation.ts
|
\---store
        authStore.ts
        themeStore.ts
        uiStore.ts