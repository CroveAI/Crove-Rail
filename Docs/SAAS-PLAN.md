## Crove → SaaS: Kế hoạch đa-tenant + billing

Mục tiêu: biến Crove thành sản phẩm SaaS sẵn sàng production, hỗ trợ đa tenant (workspace/organization), subscription billing (seat + usage), feature entitlements và vận hành ổn định. Backend dựa trên Rails (Ruby) hiện có, frontend Vue.js/TypeScript. Thời lượng ước tính theo năng lực "build cùng AI Agent".

### Phạm vi
- Đa tenant theo workspace (organization) với vai trò (Owner/Admin/Member).
- Billing Stripe: gói theo seat, add‑on usage (AI tokens/attachments/automation runs).
- Giới hạn tính năng theo plan (entitlements), rate limit và quota theo tenant.
- Quản trị: mời thành viên, hóa đơn/chi trả, usage insights, audit log.
- Hạ tầng: subdomain per tenant, custom domain sau.

---

## Kiến trúc tổng thể

### Lựa chọn tenancy
- Row‑Level Security (PostgreSQL RLS) + `tenant_id` trên mọi bảng đa tenant.
- Ưu điểm: 1 database, đa tenant dễ vận hành; enforce an toàn ngay tại DB.
- Thay thế về sau: schema per tenant nếu cần tách hiệu năng.

### Phát hiện tenant (tenant resolution)
- Subdomain: `https://{workspace}.crove.dev` → middleware đặt `tenantId`.
- API: chấp nhận header `X-Tenant-Id` cho máy‑máy (được xác thực).
- CLI/Jobs: đọc `tenantId` từ payload hoặc tham số.

### Sơ đồ luồng
```mermaid
flowchart LR
  A[Client App (apps/web, apps/app)] -- request --> M[Middleware tenant resolver]
  M --> B[apps/api routes]
  B --> P[packages/database (Prisma)]
  P -->|RLS enforced| DB[(PostgreSQL + pgvector)]
  B --> R[Redis]
  B --> S3[(Object Storage)]
  B --> STR[Stripe Billing]
  B --> OBS[(Sentry/PostHog)]
```

### Cấu trúc Chatwoot/Rails (hiện có)
- `app/controllers/api/v1`: API routes/webhooks, sẽ thêm `billing`, `organizations`
- `app/javascript/dashboard`: Vue.js frontend 
- `app/models`: ActiveRecord models, sẽ thêm `Organization`, `Membership`, `Subscription`
- `app/services`: Business logic, đã có `Crove::FeatureService`
- `db/migrate`: Database migrations với PostgreSQL
- `config/features.yml`: Feature flags configuration

---

## Data model (ActiveRecord + PostgreSQL)

Các bảng chính (bổ sung/cập nhật):
- `Organization` (workspace)
  - id, name, slug, ownerUserId
  - stripeCustomerId, defaultPlan, trialEndsAt, status
  - createdAt/updatedAt
- `Membership`
  - id, organizationId, userId, role(enum: OWNER, ADMIN, MEMBER)
- `Subscription`
  - id, organizationId, stripeSubscriptionId, plan, status, currentPeriodEnd
  - seats, seatPrice, currency
- `UsageMeter`
  - id, organizationId, metric(enum: AI_TOKENS, AUTOMATION_RUN, ATTACHMENT_GB)
  - window(enum: DAILY, MONTHLY), value(number), lastReportedAt
- `Entitlement`
  - id, plan, featureKey, limitNullable, enabled:boolean
- Bảng nghiệp vụ hiện có: thêm `tenantId = organizationId` + chỉ mục `(tenantId, ...)`.

RLS: bật `ENABLE ROW LEVEL SECURITY` và policy `tenant_id = current_setting('app.current_tenant')::uuid`.

---

## Billing (Stripe)

### Thành phần
- Sản phẩm/giá:
  - Base plan (Free/Pro/Business) theo seat.
  - Add‑on usage: AI tokens, automations, storage.
- Luồng Checkout/Portal:
  - `POST /api/billing/checkout` → tạo Checkout Session cho org.
  - `GET /api/billing/portal` → tạo Billing Portal Session.
- Webhooks `POST /api/webhooks/stripe`:
  - `customer.subscription.created/updated/deleted` → cập nhật `Subscription`.
  - `invoice.paid/failed` → dunning, trạng thái.
  - `customer.created` → map `stripeCustomerId`.
- Metered billing:
  - Cron/worker đẩy `usage_records` theo metric từ `UsageMeter`.
  - Real‑time counter trong Redis, flush batch vào Postgres rồi report Stripe.

### Entitlements & limits
- Bảng `Entitlement` ánh xạ plan → features: số seat tối đa, số projects, AI tokens/tháng, v.v.
- Middleware kiểm tra entitlement trước khi phục vụ API; trả 402/upgrade link nếu vượt.

---

## Identity & Access
- Devise auth (đã có sẵn trong Chatwoot) + Organizations extension
- Mời thành viên qua email, nhận vai trò
- SSO SAML/OIDC (phase sau, Enterprise)
- API keys per org cho tích hợp máy-máy

---

## Storage, Events, Observability
- S3 (MinIO/S3): prefix theo `tenantId`.
- Webhooks outbound theo org (đăng ký sự kiện), retry với backoff.
- Sentry/PostHog: gắn `tenantId` vào breadcrumbs để theo dõi.

---

## Phân kỳ triển khai (phases)

### P0 – Nền tảng tenancy (1–2 tuần, theo AI Agent)
- Thêm models `Organization`, `Membership` trong ActiveRecord
- Migration: thêm `organization_id` vào các bảng đa-tenant, index
- Middleware resolve tenant từ subdomain trong Rails
- Implement PostgreSQL RLS policies và test

### P1 – Billing cơ bản (1–2 tuần)
- Tạo `Subscription`, tích hợp Stripe Checkout/Portal.
- Webhooks cập nhật trạng thái subscription.
- Entitlements tối thiểu (số thành viên, số project, API rate limit).

### P2 – Usage metering (1 tuần)
- Counters Redis + batch flush, bảng `UsageMeter`.
- Reporter đẩy usage lên Stripe hàng giờ.

### P3 – Admin & trải nghiệm người dùng (1–2 tuần)
- Trang Billing, Usage, Members, Invite.
- Banner/Guard khi quá giới hạn, CTA nâng cấp.

### P4 – Advanced (2+ tuần, song song)
- Custom domains per tenant, SSO Enterprise, audit log, webhooks outbound.
- Migrate sang schema‑per‑tenant nếu cần.

---

## Definition of Done
- Multi‑tenant an toàn bằng RLS, test E2E subdomain.
- Subscription hoạt động (upgrade/downgrade/cancel/portal), webhooks idempotent.
- Entitlements/limits enforced server‑side; UI phản hồi rõ ràng.
- Usage metering đúng và được đối soát với Stripe.
- Observability, alerting, backup DB và retention dữ liệu.

---

## Việc cần làm theo cấu trúc Rails
- `db/migrate`: Tạo migrations cho Organization, Membership, Subscription
- `app/models`: ActiveRecord models với associations và validations
- `app/controllers/api/v1`:
  - Middleware tenancy; controllers: `billing`, `organizations`, `members`
  - `webhooks/stripe_controller` với idempotency
- `app/services`:
  - `Stripe::CheckoutService`, `Stripe::PortalService`
  - `UsageReportingService` cho metered billing
- `app/javascript/dashboard`: Vue components cho Billing/Usage/Members
- `config/features.yml`: Map features theo plan (Free/Pro/Business)

---

## Rủi ro & phương án
- RLS sai cấu hình → lộ dữ liệu: bắt buộc test integration cho mọi query đa‑tenant.
- Webhook idempotency: lưu `eventId` đã xử lý.
- Stripe metered: lệch số → đối soát định kỳ và cảnh báo.

---

## Kế hoạch triển khai nhanh (checklist)

### Sprint 1: Foundation (Week 1-2)
- [ ] Tạo migrations và models cho Organization/Membership/Subscription
- [ ] Middleware subdomain resolver trong ApplicationController
- [ ] Basic CRUD APIs cho organizations

### Sprint 2: Billing (Week 3-4)  
- [ ] Stripe integration: products/prices setup
- [ ] Checkout và Portal controllers
- [ ] Webhooks handler với idempotency

### Sprint 3: Features & UI (Week 5-6)
- [ ] Feature entitlements trong Crove::FeatureService
- [ ] Vue components: Billing, Members, Usage
- [ ] Usage metering với Redis + background jobs

### Sprint 4: Polish (Week 7-8)
- [ ] Testing và bug fixes
- [ ] Documentation và deployment guides
- [ ] Monitoring và alerting setup



