export default {
  register(/* { strapi } */) {},
  async bootstrap({ strapi }: { strapi: any }) {
    // Seed default homepage content if none exists
    const homepageCount = await strapi.documents('api::homepage.homepage').count({});
    if (homepageCount === 0) {
      await strapi.documents('api::homepage.homepage').create({
        data: {
          heroTitle: 'Crove — AI-native automations for your workflows',
          heroSubtitle: 'Tăng tốc vận hành với tự động hoá no-code và AI agents.',
          primaryCtaLabel: 'Get started',
          primaryCtaHref: '/#get-started',
          secondaryCtaLabel: 'Learn more',
          secondaryCtaHref: '/#features',
          ctaHeading: 'Ready to automate?',
          ctaDescription: 'Kết nối quy trình hiện tại, kích hoạt tác vụ thông minh và theo dõi kết quả.',
          ctaPrimaryLabel: 'Try Crove',
          ctaPrimaryHref: '/#try',
          ctaSecondaryLabel: 'Contact sales',
          ctaSecondaryHref: '/#contact',
        },
      });
      strapi.log.info('[seed] Created default Homepage');
    }

    // Seed default FAQ content if none exists
    const faqCount = await strapi.documents('api::faq.faq').count({});
    if (faqCount === 0) {
      await strapi.documents('api::faq.faq').create({
        data: { question: 'Crove là gì?', answer: 'Nền tảng tự động hoá quy trình với AI và no-code.' },
      });
      await strapi.documents('api::faq.faq').create({
        data: { question: 'Có bản dùng thử không?', answer: 'Có, bạn có thể bắt đầu miễn phí trên trang chủ.' },
      });
      await strapi.documents('api::faq.faq').create({
        data: { question: 'Hỗ trợ tích hợp nào?', answer: 'Webhook, Zapier/Make, REST API và tích hợp tùy chỉnh.' },
      });
      strapi.log.info('[seed] Created default FAQs');
    }

    // Seed pricing (single) and tiers if pricing not exists
    try {
      const pricingCount = await strapi.documents('api::pricing.pricing').count({});
      if (pricingCount === 0) {
        await strapi.documents('api::pricing.pricing').create({
          data: {
            title: 'Pricing that grows with your team size.',
            lead: 'Chọn gói phù hợp, có thể nâng cấp sau.',
          },
        });
        strapi.log.info('[seed] Created default Pricing');
      }
    } catch (_e) {
      // pricing content type may not exist yet
    }

    try {
      const tierCount = await strapi.documents('api::pricing-tier.pricing-tier').count({});
      if (tierCount === 0) {
        await strapi.documents('api::pricing-tier.pricing-tier').create({
          data: {
            name: 'Starter',
            slug: 'starter',
            description: 'Everything you need to start.',
            priceMonthly: 0,
            highlights: ['Up to 3 team members', 'Basic features'],
          },
        });
        await strapi.documents('api::pricing-tier.pricing-tier').create({
          data: {
            name: 'Growth',
            slug: 'growth',
            description: 'All the extras for your growing team.',
            priceMonthly: 49,
            highlights: ['Up to 10 team members', 'Unlimited boards'],
          },
        });
        await strapi.documents('api::pricing-tier.pricing-tier').create({
          data: {
            name: 'Enterprise',
            slug: 'enterprise',
            description: 'Added flexibility at scale.',
            priceMonthly: 199,
            highlights: ['Unlimited members', 'Priority support'],
          },
        });
        strapi.log.info('[seed] Created default Pricing Tiers');
      }
    } catch (_e) {
      // tiers content type may not exist yet
    }

    // Company seed temporarily disabled until content type is ready
  },
};
