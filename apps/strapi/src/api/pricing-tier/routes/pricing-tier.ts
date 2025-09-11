import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::pricing-tier.pricing-tier', {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});


