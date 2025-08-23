# Scripts

This directory contains utility scripts for the ETHRank application.

## prune-duplicates.ts

A script to safely remove duplicate address entries from the database. This script:

- Finds all addresses with duplicate entries (same address and season)
- Keeps only the most recent entry for each address/season combination
- Safely removes older duplicate entries
- Provides detailed logging of the process
- Verifies that no duplicates remain after cleanup

### Usage

```bash
npm run prune-duplicates
```

### Safety Features

- **DOES NOT WIPE THE DATABASE** - Only removes duplicate entries
- Keeps the most recent entry for each address/season combination
- Provides detailed logging before and after the operation
- Verifies the cleanup was successful

### When to Use

Run this script when you notice duplicate address entries in the database, typically caused by:
- Users refreshing pages during long score calculations
- Multiple simultaneous requests for the same address
- Network timeouts causing retries

### Output Example

```
Starting duplicate address pruning...
Found 15 address/season combinations with duplicates
Processing 0x1234... (season 5) - 3 duplicates
  Removed 2 duplicate records for 0x1234... (season 5)
Processing 0x5678... (season 5) - 2 duplicates
  Removed 1 duplicate records for 0x5678... (season 5)

Pruning complete! Total records removed: 3
✅ No duplicates remain in the database
Script completed successfully
```
