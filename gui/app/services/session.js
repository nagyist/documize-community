// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { Promise as EmberPromise } from 'rsvp';
import SimpleAuthSession from 'ember-simple-auth/services/session';

export default SimpleAuthSession.extend({
	ajax: service(),
	appMeta: service(),
	userSvc: service('user'),
	store: service(),
	localStorage: service(),
	folderPermissions: null,
	currentFolder: null,
	isMac: false,
	isMobile: false,

	hasAccounts: computed('isAuthenticated', 'session.content.authenticated.user', function () {
		return this.get('session.authenticator') !== 'authenticator:anonymous' && this.get('session.content.authenticated.user.accounts').length > 0;
	}),

	accounts: computed('hasAccounts', function () {
		return this.get('session.content.authenticated.user.accounts');
	}),

	user: computed('isAuthenticated', 'session.content.authenticated.user', function () {
		if (this.get('isAuthenticated')) {
			let user = this.get('session.content.authenticated.user') || { id: '0' };
			let data = this.get('store').normalize('user', user);
			let um = this.get('store').push(data)

			return um;
		}
	}),

	authenticated: computed('session.content.authenticated.user', function () {
		if (is.null(this.get('session.authenticator'))) return false;
		return this.get('session.authenticator') !== 'authenticator:anonymous' && this.get('session.content.authenticated.user.id') !== '0';
	}),

	isAdmin: computed('session.content.authenticated.user', function () {
		return this.get('session.authenticator') !== 'authenticator:anonymous' &&
			this.get('session.content.authenticated.user.id') !== '0' &&
			this.get('session.content.authenticated.user.admin') === true;
	}),

	isEditor: computed('session.content.authenticated.user', function () {
		return this.get('session.authenticator') !== 'authenticator:anonymous' &&
			this.get('session.content.authenticated.user.id') !== '0' &&
			this.get('session.content.authenticated.user.editor') === true;
	}),

	isGlobalAdmin: computed('session.content.authenticated.user', function () {
		return this.get('session.authenticator') !== 'authenticator:anonymous' &&
			this.get('session.content.authenticated.user.id') !== '0' &&
			this.get('session.content.authenticated.user.global') === true;
	}),

	init() {
		this._super(...arguments);

		this.set('isMac', is.mac());
		this.set('isMobile', is.mobile());
	},

	logout() {
		this.get('localStorage').clearAll();
	},

	seenNewVersion() {
		this.get('userSvc').getUser(this.get('user.id')).then((user) => {
			user.set('lastVersion', this.get('appMeta.version'));
			this.get('userSvc').save(user);
		});
	},

	// set what's new indicator
	hasWhatsNew() {
		return new EmberPromise((resolve) => {
			return this.get('userSvc').getUser(this.get('user.id')).then((user) => {
				resolve(user.get('lastVersion') !== this.get('appMeta.version'));
			});
		});
	}
});
