const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const legacy = require('zigbee-herdsman-converters/lib/legacy');
const ota = require('zigbee-herdsman-converters/lib/ota');
const tuya = require('zigbee-herdsman-converters/lib/tuya');
const utils = require('zigbee-herdsman-converters/lib/utils');
const globalStore = require('zigbee-herdsman-converters/lib/store');
const e = exposes.presets;
const ea = exposes.access;

const tzDatapoints = {
    ...tuya.tz.datapoints,
    key: [...tuya.tz.datapoints.key,  'far_detection', 'near_detection', 'interval_time',]
}

module.exports = [
    {
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_laokfqwu'}],
        model: 'WZ-M100',
        vendor: 'Wenzhi',
        description: 'Human presence sensor',
        fromZigbee: [tuya.fz.datapoints],
        toZigbee: [tzDatapoints],
    		onEvent: tuya.onEventSetTime, // Add this if you are getting no converter for 'commandMcuSyncTime'
    		configure: tuya.configureMagicPacket,
        exposes: [
            e.enum('presence_state', ea.STATE, ['none', 'presence']).withDescription('presence_state'),
            e.numeric('sensitivity', ea.STATE_SET).withValueMin(1).withValueMax(9).withValueStep(1).withDescription('sensitivity of the radar'),
       			e.numeric('near_detection', ea.STATE_SET).withValueMin(0).withValueMax(10.0).withDescription('minimum detection range').withValueStep(0.1).withUnit('m'),
        		e.numeric('far_detection', ea.STATE_SET).withValueMin(0).withValueMax(10.0).withDescription('maximum detection range').withValueStep(0.1).withUnit('m'),
            e.numeric('distance', ea.STATE).withValueMin(0).withValueMax(10.0).withDescription('target distance').withValueStep(0.01).withUnit('m'),
            e.numeric('illuminance_value', ea.STATE).withValueMin(0).withValueMax(2000).withDescription('illuminance_lux').withValueStep(1).withUnit('lux'),
            e.numeric('interval_time', ea.STATE_SET).withValueMin(1).withValueMax(3600).withDescription('interval_time').withValueStep(1).withUnit('s'),
            e.numeric('detection_delay', ea.STATE_SET).withValueMin(0).withValueMax(10.0).withValueStep(0.1).withUnit('s').withDescription('detection delay'),
            e.numeric('fading_time', ea.STATE_SET).withValueMax(1500).withValueMin(5).withValueStep(5).withUnit('s').withDescription('presence timeout'),
            
        ],
        meta: {
            tuyaDatapoints: [
                [1, 'presence_state', tuya.valueConverterBasic.lookup({'none': tuya.enum(0), 'presence': tuya.enum(1)})],
                [2, 'sensitivity', tuya.valueConverter.raw],
                [3, 'near_detection', tuya.valueConverter.divideBy100],
                [4, 'far_detection', tuya.valueConverter.divideBy100],
								[9, 'distance', tuya.valueConverter.divideBy100],
								[103, 'illuminance_value', tuya.valueConverter.raw],
								[104, 'interval_time', tuya.valueConverter.raw],
								[105, 'detection_delay', tuya.valueConverter.divideBy10],
								[106, 'fading_time', tuya.valueConverter.divideBy10],
            ],
        },

    },
];
