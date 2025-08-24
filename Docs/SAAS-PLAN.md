## Crove → SaaS: Kế hoạch đa-tenant + billing

Mục tiêu: biến Crove thành sản phẩm SaaS sẵn sàng production, hỗ trợ đa tenant (workspace/organization), subscription billing (seat + usage), feature entitlements và vận hành ổn định. Toàn bộ backend/frontend viết bằng TypeScript [[memory:6418507]]. Thời lượng ước tính theo năng lực “build cùng AI Agent” thay vì coder thủ công [[memory:6418492]].

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

### Liên kết monorepo (hiện có)
- `apps/api`: API routes/webhooks, tách domain `billing`, `tenancy`, `usage`.
- `apps/app` + `apps/web`: UI end‑user và marketing/app shell.
- `packages/database`: Prisma, sẽ thêm `tenant_id` + policies RLS.
- `packages/auth`: tổ chức theo `Organization`, `Membership`.
- `packages/feature-flags`: ánh xạ sang entitlements theo plan.
- `packages/payments`: tích hợp Stripe (Checkout/Portal/Webhooks/Invoices/Usage records).

---

## Data model (Prisma + Postgres)

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
- `packages/auth`: NextAuth (Email/OAuth) + Organizations.
- Mời thành viên qua email, nhận vai trò.
- SSO SAML/OIDC (phase sau, Enterprise).
- API keys per org cho tích hợp máy‑máy.

---

## Storage, Events, Observability
- S3 (MinIO/S3): prefix theo `tenantId`.
- Webhooks outbound theo org (đăng ký sự kiện), retry với backoff.
- Sentry/PostHog: gắn `tenantId` vào breadcrumbs để theo dõi.

---

## Phân kỳ triển khai (phases)

### P0 – Nền tảng tenancy (1–2 tuần, theo AI Agent)
- Thêm `Organization`, `Membership`.
- Migrate Prisma: thêm `tenantId` vào bảng đa‑tenant, index.
- Middleware resolve tenant từ subdomain, set `app.current_tenant` trước khi truy vấn.
- Viết policies RLS và test smoke.

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

## Việc cần làm theo repo
- `packages/database/prisma/schema.prisma`: thêm models và `tenantId` + index.
- `apps/api`:
  - Middleware tenancy; routes: `billing/*`, `organizations/*`, `members/*`.
  - `api/webhooks/stripe` idempotent; `api/usage/report` nội bộ.
- `packages/payments`: client Stripe, helpers Checkout/Portal, usage reporter.
- `packages/feature-flags`: chuyển thành `entitlements` map theo plan.
- `packages/auth`: Organization + Membership; hooks `useCurrentOrganization`.
- `apps/app`: UI Billing/Usage/Members, onboarding tạo workspace.

---

## Rủi ro & phương án
- RLS sai cấu hình → lộ dữ liệu: bắt buộc test integration cho mọi query đa‑tenant.
- Webhook idempotency: lưu `eventId` đã xử lý.
- Stripe metered: lệch số → đối soát định kỳ và cảnh báo.

---

## Kế hoạch triển khai nhanh (checklist)
- Tạo `Organization/Membership/Subscription` + migrations.
- Middleware subdomain → `tenantId`.
- Stripe: products/prices, Checkout + Portal, webhooks.
- Entitlements guard; UI Billing + Members.
- Usage counters + reporter.
- Tài liệu vận hành và runbooks sự cố.



