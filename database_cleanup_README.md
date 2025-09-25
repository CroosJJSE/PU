# Database Cleanup Tool

A temporary script to clean your Firestore database by removing unwanted fields from collections.

## ⚠️ WARNING

**This tool will permanently delete data from your database!** Always:
- Test in dry-run mode first
- Ensure you have backups
- Double-check your field selections
- Use with extreme caution

## Files Created

1. **`database_cleanup.js`** - Node.js script for programmatic cleanup
2. **`database_cleanup.html`** - Web interface for easy cleanup operations

## Quick Start

### Option 1: Web Interface (Recommended)

1. Open `database_cleanup.html` in your browser
2. Select collections to clean
3. Specify fields to remove
4. **Always run Dry Run first**
5. Review the logs
6. If satisfied, run Live Cleanup

### Option 2: Node.js Script

```bash
# Install dependencies
npm install firebase

# Run the script
node database_cleanup.js
```

## Collections Available

The tool is configured to work with these Firestore collections:

- **students** - Student records
- **classAttendance** - Daily class attendance
- **exams** - Exam records  
- **expenses** - Financial records
- **examAttendance** - Exam attendance records
- **marks** - Student marks/grades

## Usage Examples

### Remove Temporary Fields

```javascript
// Remove common temporary fields from all collections
await removeTempFields();
```

### Remove Specific Fields

```javascript
// Remove specific fields from students collection
await cleanSpecificCollection('students', ['tempField', 'oldField', 'unusedField']);
```

### Remove Unused Metadata Fields

```javascript
// Remove common unused fields
await removeUnusedFields();
```

### Custom Field Removal

```javascript
// Remove fields from specific collection
await removeFieldsFromCollection('students', {
    fieldsToRemove: ['tempField', 'debug', 'test']
});
```

## Configuration

### Dry Run Mode (Default)

The script runs in dry-run mode by default, which means:
- No actual changes are made
- All operations are logged
- You can see exactly what would be deleted

### Live Mode

To make actual changes:
1. Set `DRY_RUN = false` in the script
2. Or use the web interface and uncheck "Dry Run Mode"

## Safety Features

1. **Dry Run Mode** - Test without making changes
2. **Batch Processing** - Process documents in small batches
3. **Detailed Logging** - See exactly what's being changed
4. **Confirmation Prompts** - Require explicit confirmation for live mode
5. **Field Whitelisting** - Option to keep only specific fields

## Field Configuration

### Remove Specific Fields

```javascript
const fieldsToRemove = ['tempField', 'oldField', 'unusedField'];
```

### Keep Only Specific Fields

```javascript
const fieldsToKeep = ['indexNo', 'name', 'batch', 'phone', 'email'];
```

## Web Interface Features

- **Visual Collection Browser** - See all collections and their fields
- **Interactive Field Selection** - Choose which collections to clean
- **Real-time Logging** - See operations as they happen
- **Export Logs** - Download cleanup logs for review
- **Dry Run Testing** - Test before making changes

## Error Handling

The script includes comprehensive error handling:
- Collection not found errors
- Permission errors
- Network errors
- Batch processing errors

All errors are logged with timestamps and details.

## Logging

All operations are logged with:
- Timestamps
- Operation type (DRY RUN or LIVE)
- Collection name
- Document count
- Field changes
- Success/error status

## Best Practices

1. **Always start with Dry Run** - Never skip this step
2. **Backup your data** - Export collections before cleanup
3. **Test on small datasets** - Start with a few documents
4. **Review logs carefully** - Understand what will be deleted
5. **Use field whitelisting** - When in doubt, specify fields to keep
6. **Process in batches** - Don't try to clean everything at once

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check Firestore security rules
   - Ensure you have write permissions

2. **Collection Not Found**
   - Verify collection names are correct
   - Check if collections exist

3. **Field Not Found**
   - Fields might already be removed
   - Check field names for typos

4. **Batch Size Too Large**
   - Reduce `BATCH_SIZE` constant
   - Process smaller batches

### Debug Mode

Enable detailed logging by setting:
```javascript
const DEBUG = true;
```

## Cleanup After Use

**Important:** Delete these files after use for security:

```bash
rm database_cleanup.js
rm database_cleanup.html
rm database_cleanup_README.md
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review the Firestore security rules
3. Verify Firebase configuration
4. Test with a small dataset first

## Security Notes

- These files contain your Firebase configuration
- Delete them after use
- Never commit them to version control
- Use only in trusted environments

---

**Remember: This is a temporary tool for database cleanup. Use responsibly and always test first!**
