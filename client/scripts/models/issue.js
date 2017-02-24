import BaseModel from "./base-model";

export default BaseModel.createModel({
	"id": {
		"isReadOnly": true,
		"type": BaseModel.Types.Integer
	},

	"name": {},

	"description": {},

	"deadline": {
		"type": BaseModel.Types.Date,
		"isRequired": true
	}
});
