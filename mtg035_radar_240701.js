/*
 * @Author: xuzuquan xuzuquan@leapmmw.com
 * @Date: 2023-07-03 11:04:30
 * @LastEditors: xuzuquan xuzuquan@leapmmw.com
 * @LastEditTime: 2024-07-01 11:12:56
 * @FilePath: \zigbee2mqtt\ts0601_radar_new.js
 * @Description: 
 * 
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved. 
 */
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const e = exposes.presets;
const ea = exposes.access;
const tuya = require('zigbee-herdsman-converters/lib/tuya');
const {Enum} = require('zigbee-herdsman-converters/lib/tuya');

const tzdatapoints = {
    ...tuya.tz.datapoints,
    key: ['distance_report','sensor','illuminance_threshold', ...tuya.tz.datapoints.key],
};

const definition = [
    {
        fingerprint: tuya.fingerprint('TS0601', ['_TZE204_mtoaryre','_TZE204_iaeejhvf','_TZE200_dtzziy1e','_TZE204_dtzziy1e','_TZE200_clrdrnya','_TZE204_clrdrnya']),
        model: 'MTG035-ZB-RL',        
        vendor: 'LeapMMW',
        whiteLabel: [
            tuya.whitelabel('LeapMMW', 'MTG075-ZB-RL', 'Human presence sensor', ['_TZE204_iaeejhvf']),
            tuya.whitelabel('LeapMMW', 'MTG275-ZB-RL', 'Human presence sensor', ['_TZE200_dtzziy1e']),
            tuya.whitelabel('LeapMMW', 'MTG275-ZB-RL', 'Human presence sensor', ['_TZE204_dtzziy1e']),
            tuya.whitelabel('LeapMMW', 'MTG235-ZB-RL', 'Human presence sensor', ['_TZE200_clrdrnya']),
            tuya.whitelabel('LeapMMW', 'MTG235-ZB-RL', 'Human presence sensor', ['_TZE204_clrdrnya']),
        ],
        description: 'Human presence sensor with relay',
        fromZigbee: [tuya.fz.datapoints],
		toZigbee: [tzdatapoints],
        configure: tuya.configureMagicPacket,
        exposes: [
            e.presence(), e.illuminance_lux(),
            e.numeric('target_distance', ea.STATE).withDescription('Distance to target').withUnit('m'),
            e.numeric('radar_sensitivity', ea.STATE_SET).withValueMin(1).withValueMax(9).withValueStep(1)
                .withDescription('Detection sensitivity level'),
            e.numeric('detection_range', ea.STATE_SET).withValueMin(0).withValueMax(8).withValueStep(0.1).withUnit('m')
                .withDescription('Maximum distance detected by the sensor'),
            e.numeric('shield_range', ea.STATE_SET).withValueMin(0).withValueMax(8).withValueStep(0.1).withUnit('m')
                .withDescription('Nearest distance detected by the sensor'),
            e.numeric('entry_sensitivity', ea.STATE_SET).withValueMin(1).withValueMax(9).withValueStep(1)
                .withDescription('Sensitivity threshold triggered for the first time when the target enters the detection range'),
            e.numeric('entry_distance_indentation', ea.STATE_SET).withValueMin(0).withValueMax(7).withValueStep(0.1).withUnit('m')
                .withDescription('Indent the distance inward based on the dectection distance'),
            e.numeric('entry_filter_time', ea.STATE_SET).withValueMin(0).withValueMax(.5).withValueStep(0.05).withUnit('s')
                .withDescription('Sensitivity threshold triggered for the first time when the target enters the detection range '),
            e.numeric('departure_delay', ea.STATE_SET).withValueMin(0).withValueMax(600).withValueStep(1).withUnit('s').
                withDescription('Confirmation time after the target disappears'),
            e.numeric('block_time', ea.STATE_SET).withValueMin(0).withValueMax(10).withValueStep(0.1).withUnit('s')
                .withDescription('Time for the target to be detected again after switching from manned(occupy) to unmanned(unoccupy) mode'),
            e.binary('breaker_status', ea.STATE_SET, 'ON', 'OFF')
                .withDescription('Remotely control the breaker in standard mode'),
            e.enum('breaker_mode', ea.STATE_SET, ['standard', 'local'])
                .withDescription('Breaker mode: standard is remotely controlled, local is automatic'),
            e.numeric('illuminance_threshold', ea.STATE_SET).withValueMin(0).withValueMax(420).withValueStep(0.1).withUnit('lx')
                .withDescription('Illumination threshold for local (automatic) switching mode operation'),
            e.enum('status_indication', ea.STATE_SET, ['OFF', 'ON'])
                .withDescription('Indicator light will flash when human presence is detected'),
            e.enum('sensor', ea.STATE_SET, ['on', 'off', 'occupied', 'unoccupied'])
                .withDescription(`The radar sensor can be set in four states: on, off, occupied and unoccupied. For example, if set to occupied, ` +
                    `it will continue to maintain presence regardless of whether someone is present or not. If set to unoccupied, the unoccupied ` +
                    `state will be maintained permanently.`),
            e.enum('distance_report', ea.STATE_SET, ['off', 'on'])
                .withDescription('Turn off distance report can reduce zigbee overhead'),
            // e.text('cline',ea.STATE_SET)
            //     .withDescription('Debug command line'),
        ],
        meta: {
            tuyaDatapoints: [
                [1, 'presence', tuya.valueConverter.trueFalse1],
                [2, 'radar_sensitivity', tuya.valueConverter.raw],
                [3, 'shield_range', tuya.valueConverter.divideBy100],
                [4, 'detection_range', tuya.valueConverter.divideBy100],
                [6, 'equipment_status', tuya.valueConverter.raw],
                [9, 'target_distance', tuya.valueConverter.divideBy100],
                [101, 'entry_filter_time', tuya.valueConverter.divideBy10],
                [102, 'departure_delay', tuya.valueConverter.raw],
                [103, 'cline', tuya.valueConverter.raw],
                [104, 'illuminance_lux', tuya.valueConverter.divideBy10],
                [105, 'entry_sensitivity', tuya.valueConverter.raw],
                [106, 'entry_distance_indentation', tuya.valueConverter.divideBy100],
                [107, 'breaker_mode', tuya.valueConverterBasic.lookup({'standard': tuya.enum(0), 'local': tuya.enum(1)})],
                [108, 'breaker_status', tuya.valueConverterBasic.lookup({'OFF': tuya.enum(0), 'ON': tuya.enum(1)})],
                [109, 'status_indication', tuya.valueConverterBasic.lookup({'OFF': tuya.enum(0), 'ON': tuya.enum(1)})],
                [110, 'illuminance_threshold', tuya.valueConverter.divideBy10],
                [111, 'breaker_polarity', tuya.valueConverterBasic.lookup({'NC': tuya.enum(0), 'NO': tuya.enum(1)})],
                [112, 'block_time', tuya.valueConverter.divideBy10],
                [113, 'parameter_setting_result', tuya.valueConverter.raw],
                [114, 'factory_parameters', tuya.valueConverter.raw],
                [115, 'sensor', tuya.valueConverterBasic.lookup({
                    'on': tuya.enum(0), 'off': tuya.enum(1), 'occupied': tuya.enum(2), 'unoccupied': tuya.enum(3)})],
                [116, 'distance_report', tuya.valueConverterBasic.lookup({
                    'off': tuya.enum(0), 
                    'on': tuya.enum(1)
                })],
            ],
        },
    }
];
module.exports = definition;