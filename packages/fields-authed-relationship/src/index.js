import { Relationship } from '@keystonejs/fields';
import { AuthedRelationship } from './Implementation';

export default {
  type: 'AuthedRelationship',
  implementation: AuthedRelationship,
  views: Relationship.views,
  adapters: Relationship.adapters,
};
