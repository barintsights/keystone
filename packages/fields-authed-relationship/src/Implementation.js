import { Implementation } from '@keystonejs/fields';
import { parseAccessCore } from '@keystonejs/access-control';

export class AuthedRelationship extends Implementation {
  constructor(path, config, meta) {
    // Enforce stricter default access control
    const access = parseAccessCore({
      accessTypes: ['create', 'read', 'update'],
      access: config.access,
      defaultAccess: { create: false, read: true, update: false },
    });

    super(
      path,
      {
        ...config,
        access,
      },
      meta
    );

    if (typeof this.defaultValue !== 'undefined') {
      throw new Error(
        `An AuthedRelationship field's default is derived from the currently authenticated item. Try removing 'defaultValue: ...' from ${this.listKey}.${this.path}`
      );
    }

    if (this.many) {
      throw new Error(
        `An AuthedRelationship field can only be to-single, not to-many. Try removing 'many: true' from ${this.listKey}.${this.path}`
      );
    }

    // Reset this so there are no core-level isRequired checks run. We'll handle
    // them ourselves with this.isRequiredOnCreate
    this.isRequiredOnCreate = this.isRequired;
    this.isRequired = false;

    this.defaultValue = ({ context }) => {
      if (this.isRequiredOnCreate) {
        if (!context.req.authedList) {
          throw new Error(
            `An unauthenticated request attempted to create a new ${this.listKey} without specifying a value for ${this.listKey}.${this.path}<AuthenticatedRelationship>, however it is marked 'isRequired'.`
          );
        }

        if (context.req.authedList !== this.refListKey && this.isRequiredOnCreate) {
          throw new Error(
            `${this.listKey}.${this.path}<AuthedRelationship> is marked as 'isRequired'`
          );
          throw new Error(
            `A request attempted to create a new ${this.listKey} without specifying a value for ${this.listKey}.${this.path}<AuthenticatedRelationship>. This request was authenticated with the list ${this.listKey}, however ${this.listKey}.${this.path} is configured to reference the list ${this.refListKey}.`
          );
        }
      }

      if (context.req.authedItem) {
        return { connect: { id: context.req.authedItem.id } };
      }

      return undefined;
    };
  }
}
