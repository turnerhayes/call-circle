import { reduce, isEmpty, isFunction, isInteger, isDate } from "lodash";

function modelDefinitionToPropertyDefinition(def, name, values) {
	if (isFunction(def)) {
		return {
			"configurable": true,
			"value": def
		};
	}

	const propDef = {};

	if (isFunction(def.getter)) {
		propDef.get = def.getter;
	}

	if (isFunction(def.setter)) {
		let setter = def.setter;

		if (isFunction(def.type)) {
			setter = function(val) {
				if (def.isRequired && (val === null || val === undefined)) {
					throw new TypeError(`${name} is required; cannot be ${val}`);
				}

				try {
					val = def.type(val);
				}
				catch(ex) {
					const err = new TypeError(`${name} is not of the correct type: ${ex.message}`);
					err.originalError = ex;

					throw err;
				}

				return def.setter(val);
			};
		}

		propDef.set = setter;
	}

	if (!isFunction(def.getter) && !isFunction(def.setter)) {
		propDef.value = values[name];
		propDef.writable = !def.isReadOnly;
	}

	return propDef;
}

export default class BaseModel {
	static Types = {
		"Integer": (val) => {
			if (!isInteger(val)) {
				throw new Error(`${val} is not an integer`);
			}

			return parseInt(val, 10);
		},

		"Date": val => {
			if (!isDate(val)) {
				throw new Error(`${val} is not a Date`);
			}

			return val;
		}
	}

	getDataValue = (key) => {
		return this._values[key];
	}

	setDataValue = (key, value) => {
		this._values[key] = value;
	}

	static createModel(definition) {
		const modelClass = class extends BaseModel {
			constructor(values) {
				super();

				Object.defineProperty(
					this,
					"_values",
					{
						"configurable": true,
						"value": values
					}
				);

				if (isFunction(definition.initialize)) {
					definition.initialize.apply(this, arguments);
				}
			}
		};

		const staticMembers = definition.static;

		delete definition.static;

		if (!isEmpty(staticMembers)) {
			Object.defineProperties(
				modelClass,
				reduce(
					staticMembers,
					(properties, prop, name) => {
						properties[name] = modelDefinitionToPropertyDefinition(
							prop, name, this._values
						);

						return properties;
					},
					{}
				)
			);
		}

		Object.defineProperties(
			modelClass.prototype,
			reduce(
				definition,
				(properties, prop, name) => {
					properties[name] = modelDefinitionToPropertyDefinition.call(
						prop, name, this._values
					);

					return properties;
				},
				{}
			)
		);

		return modelClass;
	}
}
