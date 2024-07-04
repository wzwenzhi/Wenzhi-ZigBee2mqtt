const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const e = exposes.presets;
const ea = exposes.access;
const legacy = require('zigbee-herdsman-converters/lib/legacy');

const tuya = require('zigbee-herdsman-converters/lib/tuya');



module.exports = [{
	fingerprint: [{
		modelID: 'TS0601',
		manufacturerName: '_TZE204_7gclukjs',
	}],
	model: 'ZY-M100-24GV2',
	vendor: 'TuYa',
	description: '24G人体存在传感器',
	fromZigbee: [tuya.fz.datapoints],
	toZigbee: [tuya.tz.datapoints],
	onEvent: legacy.onEventSetLocalTime,
	exposes: [

		exposes.enum('state', ea.STATE, ['none', 'presence', 'move'])
		.withDescription('感应状态'),

		e.presence().withDescription('是否在家'),


		exposes.numeric('distance', ea.STATE)
		.withDescription('目标距离'),

		e.illuminance_lux(),
		
		exposes.numeric('radar_sensitivity', ea.STATE_SET).withValueMin(1)
		.withValueMax(10)
		.withValueStep(1)
		.withDescription('运动雷达灵敏度'),

		exposes.numeric('presence_sensitivity', ea.STATE_SET).withValueMin(1)
		.withValueMax(10)
		.withValueStep(1)
		.withDescription('静止雷达灵敏度'),

		exposes.numeric('detection_distance_min', ea.STATE_SET).withValueMin(0)
		.withValueMax(8.25)
		.withValueStep(0.75)
		.withUnit('米').withDescription('雷达感应最短距离'),
		
		exposes.numeric('detection_distance_max', ea.STATE_SET).withValueMin(0.75)
		.withValueMax(9)
		.withValueStep(0.75)
		.withUnit('米').withDescription('雷达感应最远距离'),

		exposes.numeric('keep_time', ea.STATE_SET).withValueMin(5)
		.withValueMax(15000)
		.withValueStep(1)
		.withUnit('秒').withDescription('延迟时间'),



	],
	meta: {
		multiEndpoint: true,
		tuyaDatapoints: [
			[104, 'presence', tuya.valueConverter.trueFalse1],
			[2, 'radar_sensitivity', tuya.valueConverter.raw],
			[102, 'presence_sensitivity', tuya.valueConverter.raw],

			[3, 'detection_distance_min', tuya.valueConverter.divideBy100],
			[4, 'detection_distance_max', tuya.valueConverter.divideBy100],
			
			[9, 'distance', tuya.valueConverter.divideBy100],
			
			
			[105, 'keep_time', tuya.valueConverter.raw],
			[103, 'illuminance_lux', tuya.valueConverter.raw],
			[1, 'state', tuya.valueConverterBasic.lookup({
				'none': 0,
				'presence': 1,
				'move': 2
			})],

		],
	},


}, ];
