import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Heading, Subheading } from '@/components/text'

type Props = {
  heading?: string
  description?: string
  primary?: { label: string; href: string }
  secondary?: { label: string; href: string }
}

export function CTA({ heading, description, primary, secondary }: Props) {
  const finalHeading = heading || 'Bắt đầu xây dựng quy trình AI cùng Crove hôm nay.'
  const finalDescription =
    description ||
    'Tạo tác nhân và workflow trong vài phút. Miễn phí cho đội nhỏ, nâng cấp khi bạn cần.'
  const primaryCta = primary || { label: 'Bắt đầu miễn phí', href: '#' }
  const secondaryCta = secondary || { label: 'Xem giá', href: '/pricing' }

  return (
    <div className="bg-gray-50 py-24">
      <Container>
        <Subheading>Get started</Subheading>
        <Heading as="h3" className="mt-2 max-w-3xl">
          {finalHeading}
        </Heading>
        <p className="mt-6 max-w-2xl text-lg/7 text-gray-700">{finalDescription}</p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button href={primaryCta.href}>{primaryCta.label}</Button>
          <Button variant="secondary" href={secondaryCta.href}>
            {secondaryCta.label}
          </Button>
        </div>
      </Container>
    </div>
  )
}


