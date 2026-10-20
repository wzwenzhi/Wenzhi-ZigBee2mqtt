/**
 * Zigbee2MQTT external converter
 * Tuya ZigBee sound / noise detector (USB ZigBee) - Product ID r6kfl9ta
 *
 * Based on:
 *  - Sample converter: 样品/sleep260122EN.js
 *  - Product DP spec:  声音探测器(USB_ZigBee)(r6kfl9ta)_09_07.xlsx
 *
 * Usage:
 *   1. Copy this file into the Z2M external converters directory, e.g.
 *      /app/data/external_converters/  (Docker) or ./external_converters/ (npm)
 *   2. Add it to configuration.yaml:
 *        external_converters:
 *          - noise_sensor_r6kfl9ta.js
 *   3. Restart Zigbee2MQTT and re-pair / re-interview the device.
 *
 * Note: if the "Device with modelID 'TS0601' is not supported" log shows a
 * different manufacturerName (e.g. _TZE284_r6kfl9ta), add that prefix to the
 * fingerprint list below.
 */

const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const tuya = require('zigbee-herdsman-converters/lib/tuya');

const e = exposes.presets;
const ea = exposes.access;

const definition = {
    fingerprint: tuya.fingerprint('TS0601', [
        '_TZE200_r6kfl9ta',
        '_TZE204_r6kfl9ta',
    ]),

    model: 'TS0601_noise_sensor',
    vendor: 'Tuya',
    description: 'ZigBee sound / noise detector (USB)',

    extend: [tuya.modernExtend.tuyaBase({dp: true})],

    exposes: [
        // DP 1: sound value (report only)
        e.numeric('sound_value', ea.STATE)
            .withUnit('dB')
            .withValueMin(0)
            .withValueMax(120)
            .withValueStep(1)
            .withDescription('Ambient sound level'),

        // DP 8: noise status (report only)
        e.enum('noise_status', ea.STATE, [
            'no_noise',
            'noise_normal',
            'noise',
        ]).withDescription('Noise status (no noise / normal / loud)'),

        // DP 16: minimum sound threshold (read/write)
        e.numeric('minimum_sound_threshold', ea.STATE_SET)
            .withUnit('dB')
            .withValueMin(0)
            .withValueMax(60)
            .withValueStep(1)
            .withDescription('Minimum sound threshold, below this reports no noise (default 10 dB)'),

        // DP 20: maximum sound threshold (read/write)
        e.numeric('maximum_sound_threshold', ea.STATE_SET)
            .withUnit('dB')
            .withValueMin(10)
            .withValueMax(100)
            .withValueStep(1)
            .withDescription('Maximum sound threshold, above this reports loud noise (default 40 dB)'),

        // DP 22: no-noise delay time (read/write)
        e.numeric('no_noise_delay_time', ea.STATE_SET)
            .withUnit('s')
            .withValueMin(0)
            .withValueMax(300)
            .withValueStep(1)
            .withDescription('Time to keep noise state after sound exceeds the change threshold (default 10 s)'),

        // DP 102: noise change reporting threshold (read/write)
        e.enum('noise_change_threshold', ea.STATE_SET, [
            '1DB',
            '3db',
            '5db',
            '10db',
            '20db',
            'no_report',
        ]).withDescription('Noise change reporting threshold (default no_report)'),

        // DP 101: delayed noise status report (report only)
        e.enum('noise_delay_status', ea.STATE, [
            'noise',
            'no_noise',
            'noise_2min',
            'noise_5min',
            'no_noise_2min',
            'no_noise_5min',
            'no_noise_10min',
            'noise_normal',
            'noise_normal_2min',
            'noise_normal_5min',
        ]).withDescription('Delayed noise status'),

        // DP 103: delay before reporting noise on state change (read/write)
        e.numeric('noise_delay_time', ea.STATE_SET)
            .withUnit('s')
            .withValueMin(0)
            .withValueMax(300)
            .withValueStep(1)
            .withDescription('Delay before reporting noise when no-noise -> noise changes (default 3 s)'),
    ],

    meta: {
        tuyaDatapoints: [
            // DP 1: sound value in dB
            [1, 'sound_value', tuya.valueConverter.raw],
            // DP 8: noise status (no_noise / noise_normal / noise)
            [8, 'noise_status', tuya.valueConverterBasic.lookup({
                no_noise: tuya.enum(0),
                noise_normal: tuya.enum(1),
                noise: tuya.enum(2),
            })],
            // DP 16: minimum sound threshold
            [16, 'minimum_sound_threshold', tuya.valueConverter.raw],
            // DP 20: maximum sound threshold
            [20, 'maximum_sound_threshold', tuya.valueConverter.raw],
            // DP 22: no-noise delay time
            [22, 'no_noise_delay_time', tuya.valueConverter.raw],
            // DP 102: noise change reporting threshold
            [102, 'noise_change_threshold', tuya.valueConverterBasic.lookup({
                '1DB': tuya.enum(0),
                '3db': tuya.enum(1),
                '5db': tuya.enum(2),
                '10db': tuya.enum(3),
                '20db': tuya.enum(4),
                no_report: tuya.enum(5),
            })],
            // DP 101: delayed noise status report
            [101, 'noise_delay_status', tuya.valueConverterBasic.lookup({
                noise: tuya.enum(0),
                no_noise: tuya.enum(1),
                noise_2min: tuya.enum(2),
                noise_5min: tuya.enum(3),
                no_noise_2min: tuya.enum(4),
                no_noise_5min: tuya.enum(5),
                no_noise_10min: tuya.enum(6),
                noise_normal: tuya.enum(7),
                noise_normal_2min: tuya.enum(8),
                noise_normal_5min: tuya.enum(9),
            })],
            // DP 103: delay before reporting noise
            [103, 'noise_delay_time', tuya.valueConverter.raw],
        ],
    },
};

module.exports = definition;
