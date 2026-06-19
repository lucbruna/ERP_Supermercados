#!/bin/bash
set -e

echo "Initializing Elasticsearch index template for CRM logs..."

# Wait for Elasticsearch to be ready
until curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; do
  echo "Waiting for Elasticsearch..."
  sleep 3
done

echo "Elasticsearch is ready. Creating index template..."

# Create index template for crm-logs-*
curl -X PUT "http://localhost:9200/_index_template/crm-logs-template" \
  -H "Content-Type: application/json" \
  -d '{
  "index_patterns": ["crm-logs-*"],
  "priority": 100,
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "refresh_interval": "5s",
      "index.mapping.total_fields.limit": 2000,
      "index.lifecycle.name": "crm-logs-lifecycle",
      "index.lifecycle.rollover_alias": "crm-logs"
    },
    "mappings": {
      "dynamic_templates": [
        {
          "strings_as_keyword": {
            "match_mapping_type": "string",
            "mapping": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        {
          "metadata_object": {
            "match": "metadata",
            "match_mapping_type": "object",
            "mapping": {
              "type": "object",
              "enabled": true
            }
          }
        }
      ],
      "properties": {
        "@timestamp": {
          "type": "date"
        },
        "message": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 512
            }
          }
        },
        "level": {
          "type": "keyword"
        },
        "serviceName": {
          "type": "keyword"
        },
        "service": {
          "type": "keyword"
        },
        "environment": {
          "type": "keyword"
        },
        "hostname": {
          "type": "keyword"
        },
        "pid": {
          "type": "long"
        },
        "correlationId": {
          "type": "keyword"
        },
        "requestId": {
          "type": "keyword"
        },
        "method": {
          "type": "keyword"
        },
        "url": {
          "type": "keyword"
        },
        "statusCode": {
          "type": "integer"
        },
        "duration": {
          "type": "integer"
        },
        "ip": {
          "type": "ip"
        },
        "userAgent": {
          "type": "keyword"
        },
        "stack": {
          "type": "text"
        },
        "errorName": {
          "type": "keyword"
        },
        "metadata": {
          "type": "object",
          "dynamic": true
        }
      }
    }
  },
  "composed_of": []
}'

echo "Index template created successfully."

# Create ILM policy for log retention (30 days)
curl -X PUT "http://localhost:9200/_ilm/policy/crm-logs-lifecycle" \
  -H "Content-Type: application/json" \
  -d '{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_size": "50gb",
            "max_age": "7d"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "14d",
        "actions": {
          "set_priority": {
            "priority": 50
          }
        }
      },
      "cold": {
        "min_age": "21d",
        "actions": {
          "set_priority": {
            "priority": 0
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'

echo "ILM policy created successfully."
echo "Elasticsearch initialization complete."
