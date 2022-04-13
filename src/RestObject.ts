import { Collection } from './Collection';
import lGet from 'lodash/get';
import { ABSENT } from './utils';
import join from 'path.join';
import { REST_CREATE, REST_GET, REST_SAVE } from './constants';
import { RestOptions } from './types';
import { e } from '@wonderlandlabs/forest';

/**
 * a RestObject is a bridge for record to a remote point
 * at which the data in the form is saved.
 * It's an IO/conduit to getting and saving data from a collection to a backend store.
 *
 * RestObject exists because a collection of fields may be connected to (none),
 * one, or many different rest IOs at which data is being stored.
 */
export class RestObject {
  constructor(
    collection: Collection,
    name,
    fields,
    config?: RestOptions,
    identity = ABSENT
  ) {
    this.name = name;
    this.collection = collection;
    this.fields = fields;
    this.identity = identity;
    this.options = config;
  }

  private fields: any;
  private options: RestOptions | undefined;
  private identity: any;
  private collection: Collection;
  private name: string;

  url(action: string) {
    const actionUrl = lGet(this, 'options.urls.' + action);
    let url = actionUrl ? actionUrl : this.options?.url;

    url = this._addParentUrl(action, url);

    if (url) {
      return this._addId(action, url);
    }

    throw e('cannot make url', {
      action,
      target: this,
      name: this.name,
      url,
      actionUrl,
    });
  }

  serializeData() {
    if (this.options?.serialize) {
      return this.options.serialize(
        this.collection,
        this.fields,
        this.identity,
        this
      );
    }

    const out = {};

    this.fields.forEach(name => {
      out[name] = this.collection.value[name]?.value?.value;
    });

    if (this.identity !== ABSENT && this.options?.identityName) {
      out[this.options?.identityName] = this.identity;
    }

    return out;
  }

  save() {
    const data = this.serializeData();
    if (this.options?.send) {
      return this.options.send(REST_SAVE, data);
    }
    if (this.collection.value.options?.send) {
      return this.collection.value.options.send(REST_SAVE, data);
    }

    throw e('send must be a function in the rest object or its collection', {
      target: this,
    });
  }

  _addParentUrl(action: string, url: string) {
    // uses a shared base url, if present
    const parentUrl = this.collection.value.options?.url(action);

    // the url can be a union of the parent and current url
    // -- or 100% the parent url
    // -- or 100% the current url
    if (parentUrl) {
      url = url ? join(parentUrl, url) : parentUrl;
    }

    return url;
  }
  _addId(action, url: string) {
    if (!url || this.identity === ABSENT) {
      return url;
    }

    if (/:id/.test(url)) {
      return url.replace(':id', this.identity || '');
    }

    switch (action) {
      case REST_GET:
        url = join(url, this.identity);
        break;

      case REST_SAVE:
        url = join(url, this.identity);
        break;

      case REST_CREATE:
        url = join(url, this.identity);
        break;
    }
    return url;
  }
}
