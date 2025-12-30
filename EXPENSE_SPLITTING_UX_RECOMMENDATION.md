# Expense Splitting UX Recommendation

## Current Issues
1. ❌ Split toggle opens modal with ALL expenses - no selection
2. ❌ No tracking of which expenses have been split
3. ❌ Cannot exclude already-split expenses from future splits

## Recommended Solution: Hybrid Approach

### 1. **Split While Adding (Quick Split)**
- Add optional "Split this expense" checkbox in ExpenseModal
- If checked, automatically split the expense when added
- Best for: Single expenses that need immediate splitting

### 2. **Bulk Split After Adding (Recommended)**
- Enable multi-select mode for expenses
- Allow users to select which expenses to split
- Calculate total only from selected expenses
- Mark selected expenses as "split" after splitting
- Best for: Multiple expenses, reviewing before splitting

### 3. **Split Tracking**
- Add `isSplit: boolean` field to expenses in Firestore
- Add `splitDate: timestamp` to track when split
- Visual indicator (badge/icon) on split expenses
- Filter out split expenses from future split calculations

## Implementation Priority

### Phase 1: Core Functionality (Recommended First)
1. Add expense selection mechanism
2. Modify split modal to accept selected expenses
3. Add split tracking fields to Firestore
4. Visual indicators for split expenses

### Phase 2: Enhanced UX
1. Quick split option in ExpenseModal
2. Filter to show only unsplit expenses
3. Split history/records

## UX Flow Recommendation

**Option A: Split After Adding (Recommended)**
```
1. User adds expenses normally
2. User toggles "Split" mode
3. User selects expenses to split (checkboxes)
4. User clicks "Split Selected" button
5. Split modal opens with selected expenses total
6. User confirms split
7. Selected expenses marked as "split"
```

**Option B: Split While Adding**
```
1. User adds expense
2. User checks "Split this expense" checkbox
3. Expense is added and immediately split
4. Expense marked as "split"
```

## Benefits of Hybrid Approach
✅ Flexibility: Users choose when to split
✅ Accuracy: Only selected expenses are split
✅ Tracking: Know which expenses are already split
✅ No Double-Counting: Split expenses excluded from future splits
✅ Better UX: Matches industry standards (Splitwise, Settle Up)

