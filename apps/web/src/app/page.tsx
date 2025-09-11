import { BentoCard } from '@/components/bento-card'
import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Gradient } from '@/components/gradient'
import { Keyboard } from '@/components/keyboard'
import { LinkedAvatars } from '@/components/linked-avatars'
import { LogoCloud } from '@/components/logo-cloud'
import { LogoCluster } from '@/components/logo-cluster'
import { LogoTimeline } from '@/components/logo-timeline'
import { Map } from '@/components/map'
import { Navbar } from '@/components/navbar'
import { Screenshot } from '@/components/screenshot'
import { Testimonials } from '@/components/testimonials'
import { Heading, Subheading } from '@/components/text'
import { CTA } from '@/components/cta'
import { FAQ } from '@/components/faq'
import { getFaqs, getHomepage } from '@/lib/cms'
import type { Metadata } from 'next'
import type { Homepage } from '@/lib/cms'

export const metadata: Metadata = {
  description:
    'Crove giúp bạn tạo quy trình AI tự động hoá cho doanh nghiệp – từ intake đến hành động.',
}

function Hero({ homepage }: { homepage: Homepage | null }) {
  return (
    <div className="relative">
      <Gradient className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-black/5 ring-inset" />
      <Container className="relative">
        <Navbar />
        <div className="pt-16 pb-24 sm:pt-24 sm:pb-32 md:pt-32 md:pb-48">
          <h1 className="font-display text-6xl/[0.9] font-medium tracking-tight text-balance text-gray-950 sm:text-8xl/[0.8] md:text-9xl/[0.8]">
            {homepage?.heroTitle || 'Build autonomous AI workflows.'}
          </h1>
          <p className="mt-8 max-w-lg text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
            {homepage?.heroSubtitle ||
              'Crove giúp đội ngũ của bạn tự động hoá quy trình bằng tác nhân AI an toàn, có kiểm soát.'}
          </p>
          <div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
            <Button href={homepage?.primaryCtaHref || '#'}>
              {homepage?.primaryCtaLabel || 'Bắt đầu miễn phí'}
            </Button>
            <Button variant="secondary" href={homepage?.secondaryCtaHref || '/pricing'}>
              {homepage?.secondaryCtaLabel || 'Xem giá'}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}

function FeatureSection() {
  return (
    <div className="overflow-hidden">
      <Container className="pb-24">
        <Heading as="h2" className="max-w-3xl">
          Xây dựng, chạy và giám sát quy trình AI end‑to‑end.
        </Heading>
        <Screenshot
          width={1216}
          height={768}
          src="/screenshots/app.png"
          className="mt-16 h-144 sm:h-auto sm:w-304"
        />
      </Container>
    </div>
  )
}

function BentoSection() {
  return (
    <Container>
      <Subheading>Workflows</Subheading>
      <Heading as="h3" className="mt-2 max-w-3xl">
        Kết nối dữ liệu, công cụ và tác nhân để tự động hoá công việc.
      </Heading>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
        <BentoCard
          eyebrow="Playbooks"
          title="Thiết kế quy trình nhanh"
          description="Kéo thả bước xử lý, gọi API, RAG, function calling và human‑in‑the‑loop trong vài phút."
          graphic={
            <div className="h-80 bg-[url(/screenshots/profile.png)] bg-size-[1000px_560px] bg-position-[left_-109px_top_-112px] bg-no-repeat" />
          }
          fade={['bottom']}
          className="max-lg:rounded-t-4xl lg:col-span-3 lg:rounded-tl-4xl"
        />
        <BentoCard
          eyebrow="Integrations"
          title="Kết nối hệ thống sẵn có"
          description="Hỗ trợ webhook, REST, Postgres, Redis, Azure OpenAI, Google Vertex AI và nhiều hơn nữa."
          graphic={
            <div className="absolute inset-0 bg-[url(/screenshots/competitors.png)] bg-size-[1100px_650px] bg-position-[left_-38px_top_-73px] bg-no-repeat" />
          }
          fade={['bottom']}
          className="lg:col-span-3 lg:rounded-tr-4xl"
        />
        <BentoCard
          eyebrow="Speed"
          title="Tối ưu tốc độ thực thi"
          description="Bộ nhớ phiên, context caching và retry policy giúp tác nhân chạy ổn định với độ trễ thấp."
          graphic={
            <div className="flex size-full pt-10 pl-10">
              <Keyboard highlighted={['LeftCommand', 'LeftShift', 'D']} />
            </div>
          }
          className="lg:col-span-2 lg:rounded-bl-4xl"
        />
        <BentoCard
          eyebrow="Observability"
          title="Theo dõi & kiểm soát"
          description="Trace, metrics và audit log để kiểm soát chi phí, chất lượng và rủi ro."
          graphic={<LogoCluster />}
          className="lg:col-span-2"
        />
        <BentoCard
          eyebrow="Governance"
          title="Bảo mật cấp doanh nghiệp"
          description="RBAC, PII redaction, secret vault và kiểm soát quyền theo môi trường."
          graphic={<Map />}
          className="max-lg:rounded-b-4xl lg:col-span-2 lg:rounded-br-4xl"
        />
      </div>
    </Container>
  )
}

function DarkBentoSection() {
  return (
    <div className="mx-2 mt-2 rounded-4xl bg-gray-900 py-32">
      <Container>
        <Subheading dark>Automation</Subheading>
        <Heading as="h3" dark className="mt-2 max-w-3xl">
          Tự động hoá nghiệp vụ phức tạp bằng tác nhân AI đa bước.
        </Heading>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <BentoCard
            dark
            eyebrow="Orchestration"
            title="Điều phối tác nhân"
            description="Song song hoá bước xử lý, chia nhánh theo điều kiện và đồng bộ hoá kết quả."
            graphic={
              <div className="h-80 bg-[url(/screenshots/networking.png)] bg-size-[851px_344px] bg-no-repeat" />
            }
            fade={['top']}
            className="max-lg:rounded-t-4xl lg:col-span-4 lg:rounded-tl-4xl"
          />
          <BentoCard
            dark
            eyebrow="Tools"
            title="Dùng công cụ đúng lúc"
            description="Function calling an toàn với schema rõ ràng, hạn chế sai lệch và prompt injection."
            graphic={<LogoTimeline />}
            // `overflow-visible!` is needed to work around a Chrome bug that disables the mask on the graphic.
            className="z-10 overflow-visible! lg:col-span-2 lg:rounded-tr-4xl"
          />
          <BentoCard
            dark
            eyebrow="Human‑in‑the‑loop"
            title="Can thiệp khi cần"
            description="Bước phê duyệt, chỉnh sửa output, hoặc fallback sang kịch bản thay thế."
            graphic={<LinkedAvatars />}
            className="lg:col-span-2 lg:rounded-bl-4xl"
          />
          <BentoCard
            dark
            eyebrow="Compliance"
            title="Tuân thủ & kiểm toán"
            description="Lưu vết đầy đủ để đáp ứng chính sách nội bộ và yêu cầu kiểm toán."
            graphic={
              <div className="h-80 bg-[url(/screenshots/engagement.png)] bg-size-[851px_344px] bg-no-repeat" />
            }
            fade={['top']}
            className="max-lg:rounded-b-4xl lg:col-span-4 lg:rounded-br-4xl"
          />
        </div>
      </Container>
    </div>
  )
}

export default async function Home() {
  const [homepage, faqs] = await Promise.all([getHomepage(), getFaqs()])
  return (
    <div className="overflow-hidden">
      <Hero homepage={homepage} />
      <main>
        <Container className="mt-10">
          <LogoCloud />
        </Container>
        <div className="bg-linear-to-b from-white from-50% to-gray-100 py-32">
          <FeatureSection />
          <BentoSection />
        </div>
        <DarkBentoSection />
        <FAQ items={faqs.length ? faqs.map((f) => ({ q: f.question, a: f.answer })) : undefined} />
        <CTA
          heading={homepage?.ctaHeading || undefined}
          description={homepage?.ctaDescription || undefined}
          primary={{
            label: homepage?.ctaPrimaryLabel || 'Bắt đầu miễn phí',
            href: homepage?.ctaPrimaryHref || '#',
          }}
          secondary={{
            label: homepage?.ctaSecondaryLabel || 'Xem giá',
            href: homepage?.ctaSecondaryHref || '/pricing',
          }}
        />
      </main>
      <Testimonials />
      <Footer />
    </div>
  )
}
