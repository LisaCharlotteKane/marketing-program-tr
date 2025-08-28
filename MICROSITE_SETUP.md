# Campaign Export Microsite Setup

This repository now includes a complete solution for exporting campaign data from GitHub Issues to a public microsite on GitHub Pages.

## 🚀 Quick Start

1. **Enable GitHub Pages**:
   - Go to Repository Settings > Pages
   - Set Source to "GitHub Actions"

2. **Label Your Campaigns**:
   - Add `campaign` and `share:external` labels to issues you want to export
   - Use labels like `Region: JP & Korea`, `Type: Event`, `Planning`/`In-Flight`/`Complete`

3. **Run the Export**:
   - Manual: Go to Actions tab > "export-campaigns" > "Run workflow"
   - Automatic: Runs weekdays at 6pm UTC

4. **View Your Microsite**:
   - Visit `https://USERNAME.github.io/REPOSITORY-NAME/`

## 📁 File Structure

```
.github/workflows/export-campaigns.yml  # GitHub Action workflow
microsite/index.html                    # Source microsite
public/index.html                       # Published microsite  
public/campaigns.json                   # Exported campaign data
public/campaigns.csv                    # CSV export
```

## 🔒 Privacy Features

- Only exports issues with both `campaign` and `share:external` labels
- Strips content after "## Internal" headings
- No authentication required for viewing
- Read-only public access

## 🛠 Customization

### Labels Expected:
- `campaign` + `share:external` (required for export)
- `Planning`/`In-Flight`/`Complete` (status)
- `Region: [name]` (region classification)
- `Country: [name]` (country classification) 
- `Type: [name]` (campaign type)

### Issue Body Format:
```markdown
Campaign description here.

Budget: $50,000

## Internal
This section will be stripped from public export.
```

### Milestone:
- Due date becomes the campaign start date

## 🔧 Troubleshooting

- **Workflow fails**: Check that @octokit/rest is properly installed
- **No data**: Ensure issues have required labels
- **Pages not updating**: Check Actions tab for deployment status
- **Microsite blank**: Verify campaigns.json is being generated

## 📊 Data Format

The exported JSON includes:
- `id`: Issue number
- `title`: Issue title
- `status`: Planning/In-Flight/Complete
- `owner`: Assignee username
- `region`: From "Region: X" label
- `campaignType`: From "Type: X" label
- `start`: Milestone due date
- `budgetUSD`: Extracted from issue body
- `description`: Sanitized issue body (500 char limit)