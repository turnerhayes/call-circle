export default class IssueModel {
	constructor(args) {
		Object.defineProperties(this, {
			id: {
				enumerable: true,
				writable: false,
				value: args.id
			},
			name: {
				enumerable: true,
				configurable: true,
				value: args.name
			},
			profilePhotoURL: {
				enumerable: true,
				configurable: true,
				value: args.profilePhotoURL
			}
		});
	}
}
