import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::pricing.pricing', {
  only: ['find'],
  config: {
    find: { auth: false },
  },
});
