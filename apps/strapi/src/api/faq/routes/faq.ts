import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::faq.faq', {
  config: {
    // Public read endpoints for FAQs
    find: { auth: false },
    findOne: { auth: false },
    // Remove boolean auth on write operations; admin permissions will protect these
  },
});


