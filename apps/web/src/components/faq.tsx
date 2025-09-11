import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'

export type FAQItem = { q: string; a: string }

type Props = { items?: FAQItem[] }

const defaultFaqs: FAQItem[] = [
  {
    q: 'Crove là gì?',
    a: 'Nền tảng xây dựng quy trình tự động hoá với tác nhân AI, tích hợp dữ liệu và công cụ sẵn có.',
  },
  {
    q: 'Có miễn phí không?',
    a: 'Có gói miễn phí cho đội nhỏ và môi trường thử nghiệm. Bạn có thể nâng cấp khi cần nhiều tài nguyên hơn.',
  },
  {
    q: 'Dùng được với mô hình nào?',
    a: 'Hỗ trợ Azure OpenAI, OpenAI, Google Vertex AI và một số mô hình nội bộ qua API chuẩn.',
  },
  {
    q: 'Bảo mật thế nào?',
    a: 'RBAC, PII redaction, audit log, và tách môi trường. Dữ liệu được kiểm soát nội bộ.',
  },
]

export function FAQ({ items }: Props) {
  const faqs = items && items.length > 0 ? items : defaultFaqs
  return (
    <div className="bg-white py-24">
      <Container>
        <Subheading>FAQ</Subheading>
        <Heading as="h3" className="mt-2 max-w-3xl">
          Câu hỏi thường gặp
        </Heading>
        <dl className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {faqs.map((item) => (
            <div key={item.q}>
              <dt className="font-medium text-gray-900">{item.q}</dt>
              <dd className="mt-2 text-gray-700">{item.a}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  )
}


