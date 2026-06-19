# CDN Configuration Rules

## Cache Rules

| Asset Type | Path Pattern | Cache TTL | Cache Strategy |
|---|---|---|---|
| Static assets (images, CSS, JS, fonts) | `/assets/*`, `*.css`, `*.js`, `*.png`, `*.jpg`, `*.svg`, `*.woff2` | 30 days | Cache everything, query string as cache key |
| API responses | `/api/*` | 0s (no cache) | Bypass cache, or 60s for GET-only endpoints |
| Storage files | `/storage/*` | 1 hour | Cache based on Content-Type headers |
| HTML pages | `/*` | 60s | Cache with revalidation (ETag) |

## CDN Recommendations

### Cloudflare (Recommended)
- **Plan**: Pro or Business for API caching
- **Features**:
  - Automatic static asset caching
  - API caching with Cache Rules
  - Argo Smart Routing for lower latency
  - WAF (Web Application Firewall) for security
  - DDoS protection
  - SSL/TLS automatic certificates

### AWS CloudFront (Alternative)
- **Features**:
  - Lambda@Edge for request/response manipulation
  - Origin Shield for reduced origin load
  - Real-time logs with Kinesis Data Streams
  - Geo-restriction capabilities

## CDN Invalidation on Deploy

After every deployment, invalidate cached paths:

```bash
# Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://crm.supermercado.com/assets/*"]}'

# AWS CloudFront
aws cloudfront create-invalidation \
  --distribution-id {distribution_id} \
  --paths "/*"
```

## Security Headers

Ensure CDN passes through the following headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy` (custom per environment)

## Monitoring

- Monitor cache hit ratio (target > 80% for static assets)
- Set up alerts for 5xx origin errors
- Track bandwidth savings via CDN analytics
