const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const tuya = require('zigbee-herdsman-converters/lib/tuya');

const e = exposes.presets;
const ea = exposes.access;

const definition = {
    fingerprint: tuya.fingerprint('TS0601', [
        '_TZE200_seq9cm6u',
        '_TZE204_seq9cm6u',
    ]),
    
    model: 'TS0601_pressure_sensor',
    vendor: 'Tuya',
    description: 'ZigBee压力检测带 (带光感)',
    
    extend: [tuya.modernExtend.tuyaBase({dp: true})],
    
    exposes: [
        e.binary('pressure', ea.STATE, true, false)
            .withDescription('压力感应状态 (有压力/无压力)'),
        e.battery(),
        e.enum('sensitivity', ea.STATE_SET, ['low', 'middle', 'high'])
            .withDescription('压力阈值灵敏度'),
        e.illuminance().withUnit('lx'),
        e.numeric('no_pressure_delay', ea.STATE_SET)
            .withUnit('s')
            .withValueMin(0)
            .withValueMax(3600)
            .withDescription('无压延迟触发时间 (默认60秒)'),
        e.numeric('pressure_delay', ea.STATE_SET)
            .withUnit('s')
            .withValueMin(0)
            .withValueMax(3600)
            .withDescription('有压延时触发时间 (默认0秒)'),
        e.enum('work_state', ea.STATE, [
            'pressure',
            'none',
            'pressure_5min',
            'pressure_30min',
            'none_5min',
            'none_30min',
        ]).withDescription('延时触发状态'),
    ],
    
    meta: {
        tuyaDatapoints: [
            [1, 'pressure', tuya.valueConverterBasic.lookup({
                true: tuya.enum(0),
                false: tuya.enum(1),
            })],
            [4, 'battery', tuya.valueConverter.raw],
            [9, 'sensitivity', tuya.valueConverterBasic.lookup({
                low: tuya.enum(0),
                middle: tuya.enum(1),
                high: tuya.enum(2),
            })],
            [101, 'illuminance_interval', tuya.valueConverter.raw],
            [102, 'no_pressure_delay', tuya.valueConverter.raw],
            [103, 'pressure_delay', tuya.valueConverter.raw],
            [104, 'work_state', tuya.valueConverterBasic.lookup({
                pir: tuya.enum(0),
                none: tuya.enum(1),
                pir_5min: tuya.enum(2),
                pir_30min: tuya.enum(3),
                none_5min: tuya.enum(4),
                none_30min: tuya.enum(5),
            })],
        ],
    },
};

module.exports = definition;
