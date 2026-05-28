const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const e = exposes.presets;
const ea = exposes.access;
const legacy = require('zigbee-herdsman-converters/lib/legacy');
const tuya = require('zigbee-herdsman-converters/lib/tuya');



module.exports = [{
	fingerprint: [{
		modelID: 'TS0601',
		manufacturerName: '_TZE200_juzago6i',
	}],
	model: 'ZY24G Battery Presence sensor',
	vendor: 'TuYa',
	description: 'ZY24G Battery Presence sensor',
	fromZigbee: [tuya.fz.datapoints],
	toZigbee: [tuya.tz.datapoints],
	onEvent: legacy.onEventSetLocalTime,
	exposes: [

		exposes.enum('state', ea.STATE, ['pir', 'none'])
		.withDescription('感应状态'),

		e.occupancy().withDescription('有人移动'),


		e.illuminance(),

		exposes.numeric('radar_sensitivity', ea.STATE_SET).withValueMin(1)
		.withValueMax(10)
		.withValueStep(1)
		.withDescription('触发雷达灵敏度'),

		exposes.numeric('presence_sensitivity', ea.STATE_SET).withValueMin(1)
		.withValueMax(10)
		.withValueStep(1)
		.withDescription('存在雷达灵敏度'),


		exposes.numeric('detection_distance_max', ea.STATE_SET).withValueMin(0.5)
		.withValueMax(9)
		.withValueStep(0.5)
		.withUnit('米').withDescription('设置感应最远距离'),

		exposes.numeric('presence_timeout', ea.STATE_SET).withValueMin(10)
		.withValueMax(120)
		.withValueStep(1)
		.withUnit('秒').withDescription('延迟时间'),


		e.battery(),

	],
	meta: {
		multiEndpoint: true,
		tuyaDatapoints: [
			[1, null, {
				from: function(v, meta) {

					if (v == 0) {
						return {
							state: 'pir',
							occupancy: true,
						}
					} else if (v == 1) {
						return {
							state: 'none',
							presence: false,
						}
					} else {
						return {
							state: 'none',
							presence: false,
						}
					}

				}
			}],
			[105, 'radar_sensitivity', tuya.valueConverter.raw],
			[101, 'detection_distance_max', tuya.valueConverter.divideBy100],

			[102, 'presence_sensitivity', tuya.valueConverter.raw],
			[12, 'illuminance', tuya.valueConverter.raw],
			[4, 'battery', tuya.valueConverter.raw],
			[103, 'presence_timeout', tuya.valueConverter.raw],


		],
	},


}, ];