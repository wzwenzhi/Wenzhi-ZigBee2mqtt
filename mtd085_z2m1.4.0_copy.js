/*
 * @Author: xuzuquan xuzuquan@leapmmw.com
 * @Date: 2024-05-28 17:12:40
 * @LastEditors: xuzuquan xuzuquan@leapmmw.com
 * @LastEditTime: 2024-06-27 18:36:31
 * @FilePath: \zigbee2mqtt\mtd085.js
 * @Description: 
 * 
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved. 
 */
const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const e = exposes.presets;
const ea = exposes.access;
const tuya = require('zigbee-herdsman-converters/lib/tuya');
const {Enum} = require('zigbee-herdsman-converters/lib/tuya');

const tzDatapoints = {  
    ...tuya.tz.datapoints,  
    key: Array.isArray(tuya.tz.datapoints.key)   
        ? [...tuya.tz.datapoints.key, 'debug_mode', 'debug_distance', 'debug_countdown', 'scene_preset', 'distance_report_mode']  
        : ['debug_mode', 'debug_distance', 'debug_countdown', 'scene_preset', 'distance_report_mode']  
};  

const definition = [
    {
	fingerprint: tuya.fingerprint('TS0225', ['_TZ321C_fkzihax8','_TZ321C_4slreunp']),
	model: 'MTD085-ZB',        
	vendor: 'LeapMMW',
	whiteLabel: [
		tuya.whitelabel('LeapMMW', 'MTD095-ZB', 'Human presence sensor', ['_TZ321C_4slreunp']),
	],
    description: 'Human presence sensor',
    fromZigbee: [tuya.fz.datapoints, fz.ias_occupancy_alarm_1, fz.ias_occupancy_alarm_1_report],
    toZigbee: [tuya.tz.datapoints, tzDatapoints],
	configure: async (device, coordinatorEndpoint) => {
		await tuya.configureMagicPacket(device, coordinatorEndpoint);
	},
	exposes: [			
		e.occupancy(), e.illuminance_lux(),
		e.numeric('target_distance', ea.STATE).withDescription('Distance to target').withUnit('m'),
		e.numeric('radar_sensitivity', ea.STATE_SET).withValueMin(10).withValueMax(100).withValueStep(10).withUnit('%')
			.withDescription('Detection threshold for the strength of object energy'),
		e.numeric('detection_range', ea.STATE_SET).withValueMin(0).withValueMax(8).withValueStep(0.1).withUnit('m')
			.withDescription('Maximum distance detected by the sensor'),
		e.numeric('shield_range', ea.STATE_SET).withValueMin(0).withValueMax(8).withValueStep(0.1).withUnit('m')
			.withDescription('Nearest distance detected by the sensor'),
		e.numeric('entry_sensitivity', ea.STATE_SET).withValueMin(10).withValueMax(100).withValueStep(10).withUnit('%')
			.withDescription('Sensitivity threshold triggered for the first time when the target enters the detection range'),
		e.numeric('entry_distance', ea.STATE_SET).withValueMin(0).withValueMax(8).withValueStep(0.1).withUnit('m')
			.withDescription('Dectection distance when unoccupied'),
		e.numeric('entry_filter_time', ea.STATE_SET).withValueMin(0).withValueMax(0.5).withValueStep(0.05).withUnit('s')
			.withDescription('Sensitivity threshold triggered for the first time when the target enters the detection range '),
		e.numeric('departure_delay', ea.STATE_SET).withValueMin(5).withValueMax(7200).withValueStep(1).withUnit('s')
			.withDescription('Confirmation time after the target disappears'),
		e.numeric('block_time', ea.STATE_SET).withValueMin(0).withValueMax(10).withValueStep(0.1).withUnit('s')
			.withDescription('Time for the target to be detected again after switching from manned(occupy) to unmanned(unoccupy) mode'),
		e.enum('status_indication', ea.STATE_SET, ['OFF', 'ON'])
			.withDescription('Indicator light will turn on when human presence is detected'),
		e.enum('sensor', ea.STATE_SET, ['on', 'occupied', 'unoccupied'])
			.withDescription(`The radar sensor can be set in three states: on, occupied and unoccupied. For example, if set to occupied, ` +
				`it will continue to maintain presence regardless of whether someone is present or not. If set to unoccupied, the unoccupied ` +
				`state will be maintained permanently.`),			
		e.enum('scene_preset', ea.STATE_SET, ['Custom', 'Toilet', 'Kitchen', 'Hallway', 'Bedroom', 'Livingroom', 'Meetingroom', 'Factory default'])
			.withDescription(`Presets`),
		e.enum('distance_report_mode', ea.STATE_SET, ['Normal', 'Occupancy detection'])
			.withDescription('Indicator light will turn on when human presence is detected'),			
		e.enum('debug_mode', ea.STATE_SET, ['OFF', 'ON'])
			.withDescription(`In debug mode, radar will report more information, can be used to identify interference`),
		e.numeric('debug_distance', ea.STATE).withDescription('Real time distance to target').withUnit('m'),
		e.numeric('debug_countdown', ea.STATE).withDescription('Time before the target disappears').withUnit('s'),

	],
	meta: {            
		multiEndpoint: true,//tuyaSendCommand: 'sendData',此处做了修改
		tuyaDatapoints: [
//			[1, 'presence', tuya.valueConverter.trueFalse1],
			[101, 'entry_sensitivity', tuya.valueConverter.raw],
			[102, 'entry_distance', tuya.valueConverter.divideBy100],
			[103, 'departure_delay', tuya.valueConverter.raw],
			[104, 'entry_filter_time', tuya.valueConverter.divideBy100],
			[105, 'block_time', tuya.valueConverter.divideBy10],
			[107, 'illuminance_lux', tuya.valueConverter.divideBy10],
			[108, 'debug_mode', tuya.valueConverterBasic.lookup({'OFF': tuya.enum(0), 'ON': tuya.enum(1)})],
			[109, 'debug_distance', tuya.valueConverter.divideBy100],
			[110, 'debug_countdown', tuya.valueConverter.raw],
			[111, 'scene_preset', tuya.valueConverterBasic.lookup({'Custom': tuya.enum(0), 'Toilet': tuya.enum(1), 'Kitchen': tuya.enum(2), 'Hallway': tuya.enum(3), 'Bedroom': tuya.enum(4), 'Livingroom': tuya.enum(5), 'Meetingroom': tuya.enum(6), 'Factory default': tuya.enum(7)})],
			[112, 'sensor', tuya.valueConverterBasic.lookup({
				'on': tuya.enum(0), 'occupied': tuya.enum(1), 'unoccupied': tuya.enum(2)})],
			[113, 'cline', tuya.valueConverter.raw],
			[114, 'status_indication', tuya.valueConverterBasic.lookup({'OFF': tuya.enum(0), 'ON': tuya.enum(1)})],
			[115, 'radar_sensitivity', tuya.valueConverter.raw],
			[116, 'shield_range', tuya.valueConverter.divideBy100],
			[117, 'detection_range', tuya.valueConverter.divideBy100],
			[118, 'equipment_status', tuya.valueConverter.raw],
			[119, 'target_distance', tuya.valueConverter.divideBy100],
			[120, 'distance_report_mode', tuya.valueConverterBasic.lookup({'Normal': tuya.enum(0), 'Occupancy detection': tuya.enum(1)})],
		
		],
	},
}];

module.exports = definition;