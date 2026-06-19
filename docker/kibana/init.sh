#!/bin/bash
set -e

echo "Initializing Kibana saved objects..."

KIBANA_URL="${KIBANA_URL:-http://localhost:5601}"

# Wait for Kibana to be ready
until curl -s "$KIBANA_URL/api/status" > /dev/null 2>&1; do
  echo "Waiting for Kibana..."
  sleep 5
done

echo "Kibana is ready. Creating data view..."

# Create data view for crm-logs-*
DATA_VIEW_RESPONSE=$(curl -s -X POST "$KIBANA_URL/api/data_views/data_view" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "data_view": {
      "title": "crm-logs-*",
      "name": "CRM Logs",
      "timeFieldName": "@timestamp",
      "allowNoIndex": true
    }
  }')

DATA_VIEW_ID=$(echo "$DATA_VIEW_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$DATA_VIEW_ID" ]; then
  echo "Data view may already exist. Attempting to find existing one..."
  DATA_VIEW_ID=$(curl -s "$KIBANA_URL/api/data_views" \
    -H "kbn-xsrf: true" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

echo "Data view ID: $DATA_VIEW_ID"

# Helper function to create a visualization
create_visualization() {
  local title="$1"
  local vis_type="$2"
  local params="$3"

  curl -s -X POST "$KIBANA_URL/api/saved_objects/visualization" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d "{
      \"attributes\": {
        \"title\": \"$title\",
        \"visState\": \"$(echo "$params" | jq -c .)\",
        \"uiStateJSON\": \"{}\",
        \"description\": \"\",
        \"version\": 1,
        \"kibanaSavedObjectMeta\": {
          \"searchSourceJSON\": \"{\\\"index\\\": \\\"$DATA_VIEW_ID\\\", \\\"query\\\": {\\\"query\\\": \\\"\\\", \\\"language\\\": \\\"kuery\\\"}, \\\"filter\\\": []}\"
        }
      }
    }"
}

# Create sample dashboard
echo "Creating sample dashboard..."

DASHBOARD_PANELS="[]"

DASHBOARD=$(curl -s -X POST "$KIBANA_URL/api/saved_objects/dashboard" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d "{
    \"attributes\": {
      \"title\": \"CRM Logs Dashboard\",
      \"hits\": 0,
      \"description\": \"Centralized logging dashboard for CRM Supermercado\",
      \"panelsJSON\": \"$DASHBOARD_PANELS\",
      \"version\": 1,
      \"timeRestore\": true,
      \"timeTo\": \"now\",
      \"timeFrom\": \"now-7d\",
      \"optionsJSON\": \"{\\\"darkTheme\\\": false, \\\"hidePanelTitles\\\": false}\"
    }
  }")

echo "Dashboard created."
echo "Kibana initialization complete."
echo ""
echo "Post-setup instructions:"
echo "1. Open Kibana at http://localhost:5601"
echo "2. Go to Stack Management > Index Patterns"
echo "3. Verify 'crm-logs-*' data view exists"
echo "4. Go to Dashboard > CRM Logs Dashboard"
echo "5. Manually add visualizations for:"
echo "   - Log volume over time (line chart, @timestamp, count)"
echo "   - Log levels breakdown (pie chart, level.keyword)"
echo "   - Top errors (table, level:error, sort by @timestamp)"
echo "   - Slow requests (table, duration > 1000, sort by duration desc)"
echo "   - Services overview (table, serviceName.keyword, count)"
