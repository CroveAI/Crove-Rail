import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'

export function CTA() {
  return (
    <div className="bg-gray-50 py-24">
      <Container>
        <Subheading>Get started</Subheading>
        <Heading as="h3" className="mt-2 max-w-3xl">
          Bắt đầu xây dựng quy trình AI cùng Crove hôm nay.
        </Heading>
        <p className="mt-6 max-w-2xl text-lg/7 text-gray-700">
          Tạo tác nhân và workflow trong vài phút. Miễn phí cho đội nhỏ, nâng cấp khi bạn cần.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button href="#">Bắt đầu miễn phí</Button>
          <Button variant="secondary" href="/pricing">
            Xem giá
          </Button>
        </div>
      </Container>
    </div>
  )
}


