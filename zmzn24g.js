const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const e = exposes.presets;
const ea = exposes.access;
const legacy = require('zigbee-herdsman-converters/lib/legacy');

const tuya = require('zigbee-herdsman-converters/lib/tuya');

const dataTypes = {
	raw: 0, // [ bytes ]
	bool: 1, // [0/1]
	number: 2, // [ 4 byte value ]
	string: 3, // [ N byte string ]
	enum: 4, // [ 0-255 ]
	bitmap: 5, // [ 1,2,4 bytes ] as bits
};

const dpMap = {
	dpPresenceState: 112, //是否存在，仅上报
	dpState: 105, //感应状态
	dpMoveSensitivity: 106, //灵敏度
	dpPresenceSensitivity: 111, //灵敏度

	dpTimeout: 110, //感应延迟

	dpDistance: 109, //目标距离


	dpRange: 107, //最远距离范围
	dpIlluminanceLux: 104, //光照度




};
const fzLocal = {
	cluster: 'manuSpecificTuya',
	type: ['commandDataResponse', 'commandDataReport'],
	convert: (model, msg, publish, options, meta) => {
		const dp = msg.data.dpValues[0].dp;
		const data = msg.data;
		const value = legacy.getDataValue(data.dpValues[0]);
		const result = {};

		switch (dp) {
			case dpMap.dpPresenceState:
				result.presence = value ? true : false;
				break;
			case dpMap.dpMoveSensitivity: //灵敏度
				result.move_sensitivity = (value / 10);
				break;
			case dpMap.dpPresenceSensitivity: //静止灵敏度
				result.presence_sensitivity = (value / 10);
				break;
			case dpMap.dpRange: //雷达距离15-55
				result.radar_range = (value / 100);
				break;
			case dpMap.dpDistance: //目标距离
				result.distance = (value / 100);
				break;
			case dpMap.dpTimeout: //延迟时间0-600
				result.presence_timeout = (value);
				break;
			case dpMap.dpIlluminanceLux: //光照度
				result.illuminance_lux = (value);
				break;

			case dpMap.dpState:
				result.state = {
					0: 'none',
					1: 'presence',
					2: 'move'
				} [value];
				break;

				// meta.logger.debug(
				// 	`未解析的数据DP: ${dp} DATA: ${JSON.stringify(msg.data)}`
				// );


		}
		return result;
	},
}
const tzLocal = {
	key: [
		'move_sensitivity',
		'presence_sensitivity',
		'radar_range',
		'presence_timeout',

	],
	convertSet: async (entity, key, value, meta) => {

		switch (key) {
			case 'move_sensitivity':
				await legacy.sendDataPointValue(entity, dpMap.dpMoveSensitivity, value);
				break;
			case 'presence_sensitivity':
				await legacy.sendDataPointValue(entity, dpMap.dpPresenceSensitivity, value);
				break;
			case 'radar_range':
				await legacy.sendDataPointValue(entity, dpMap.dpRange, value * 100);
				break;
			case 'presence_timeout':
				await legacy.sendDataPointValue(entity, dpMap.dpTimeout, value);
				break;

		}
		return {
			key: value
		};
	},

}


module.exports = [{
	fingerprint: [{
		modelID: 'TS0601',
		manufacturerName: '_TZE204_ijxvkhd0',
	}],
	model: '24G 人体存在传感器',
	vendor: 'TuYa',
	description: '24G 人体存在传感器',
	fromZigbee: [fzLocal],
	toZigbee: [tzLocal],
	onEvent: legacy.onEventSetLocalTime,
	exposes: [

		exposes.enum('state', ea.STATE, ['none', 'presence', 'move'])
		.withDescription('感应状态'),

		e.presence().withDescription('是否在家'),


		exposes.numeric('distance', ea.STATE)
		.withDescription('目标距离'),

		e.illuminance_lux(),
		exposes.numeric('move_sensitivity', ea.STATE_SET).withValueMin(1)
		.withValueMax(10)
		.withValueStep(1)
		.withDescription('运动雷达灵敏度'),

		exposes.numeric('presence_sensitivity', ea.STATE_SET).withValueMin(1)
		.withValueMax(10)
		.withValueStep(1)
		.withDescription('静止雷达灵敏度'),

		exposes.numeric('radar_range', ea.STATE_SET).withValueMin(1.5)
		.withValueMax(5.5)
		.withValueStep(1)
		.withUnit('米').withDescription('雷达感应距离'),


		exposes.numeric('presence_timeout', ea.STATE_SET).withValueMin(1)
		.withValueMax(1500)
		.withValueStep(1)
		.withUnit('秒').withDescription('延迟时间'),



	],
	meta: {
		multiEndpoint: true,
		tuyaDatapoints: [



			[112, 'presence', tuya.valueConverter.trueFalse1],
			[106, 'move_sensitivity', tuya.valueConverter.divideBy10],
			[111, 'presence_sensitivity', tuya.valueConverter.divideBy10],

			[107, 'radar_range', tuya.valueConverter.divideBy100],
			[109, 'distance', tuya.valueConverter.divideBy100],
			[110, 'presence_timeout', tuya.valueConverter.raw],
			[104, 'illuminance_lux', tuya.valueConverter.raw],
			[105, 'state', tuya.valueConverterBasic.lookup({
				'none': 0,
				'presence': 1,
				'move': 2
			})],

		],
	},


}, ];