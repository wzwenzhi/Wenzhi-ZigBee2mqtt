const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const e = exposes.presets;
const ea = exposes.access;
const tuya = require('zigbee-herdsman-converters/lib/tuya');
const {Enum} = require('zigbee-herdsman-converters/lib/tuya');

const tuyaEnumConverter = (enumMap) => {
    return {
        to(value) {
            // Make sure the value is in the enumMap
            if (enumMap.hasOwnProperty(value)) {
                return new Enum(enumMap[value]);
            } else {
                throw new Error(`Invalid value for enum. Got ${value}, expected one of: ${Object.keys(enumMap).join(', ')}`);
            }
        },
        from(value) {
            // Find the key in the enumMap that corresponds to the given value
            const key = Object.keys(enumMap).find((key) => enumMap[key] === value);
            if (key) {
                return key;
            } else {
                throw new Error(`Could not find key for value ${value} in enumMap`);
            }
        },
    };
};

const commonDefinition = {
    vendor: 'LeapMMW',
    description: 'Human presence sensor',
    fromZigbee: [tuya.fz.datapoints],
    toZigbee: [tuya.tz.datapoints],
    onEvent: tuya.onEventSetTime, 
    configure: tuya.configureMagicPacket,
    exposes: [
        e.presence(), 
        e.illuminance_lux(), 		
        e.enum('config_error', ea.STATE,[
            "none",
            "invalid detection range reduce",
            "invalid minimum detection range",
            "invalid maximum detection range",
            "switch unavailable",
            "invalid inhibition time",
            "switch polarity unsupported"
        ]).withDescription('parameter config result'),
        e.numeric('radar_sensitivity', ea.STATE_SET).withValueMin(1).withValueMax(9).withValueStep(1).withDescription('sensitivity of the radar'),
        e.numeric('distance', ea.STATE).withValueMin(0).withValueMax(10).withDescription('Target distance').withValueStep(0.1).withUnit('m'),
        e.numeric('minimum_range', ea.SET).withValueMin(0).withValueMax(10).withDescription('minimum detection range').withValueStep(0.1).withUnit('m'),
        e.numeric('maximum_range', ea.SET).withValueMin(1.5).withValueMax(10).withDescription('maximum detection range').withValueStep(0.1).withUnit('m'),
		e.enum('state', ea.STATE_SET, ["off", "on"]).withDescription('On/off state of the switch'),
		e.enum('mode', ea.STATE_SET, ['standalone', 'local', 'manual','unavailable']).withDescription('Working mode of switch'),
		e.numeric('fading_time', ea.STATE_SET).withValueMax(1500).withValueMin(5).withValueStep(1).withUnit('s').withDescription('Presence timeout'),
        e.numeric('radar_scene', ea.STATE_SET).withValueMin(1).withValueMax(7).withValueStep(1).withDescription('Unoccupied sensitivity'),
        e.numeric('border', ea.STATE_SET).withValueMin(0).withValueMax(10).withValueStep(0.1).withDescription('Detection range reduce when unoccupied'),
        e.numeric('delay', ea.STATE_SET).withValueMin(0).withValueMax(60).withValueStep(0.1).withDescription('Sensor inhibition time after presence or relay state changed'),
		e.enum('self_test', ea.STATE, ["Pending", "Pass", "Fail", "Other", "Zigbee error", "Radar error"]).withDescription('Self-test result'),
		e.numeric('min_brightness', ea.STATE_SET).withValueMin(0).withValueMax(420).withValueStep(0.1).withDescription('Illuminance thershold for local switch control'),
		// e.enum('factory_reset', ea.STATE_SET, ["reset"]).withDescription('Factory reset the device'),
		// e.enum('reverse', ea.STATE_SET,['normal open', 'normal close']).withDescription('switch polarity'), //This option is not available by default
		// e.enum('indicator_led', ea.STATE_SET, ["off", "on"]).withDescription('On/off state of the led indicator'),
        e.numeric('detection_delay', ea.STATE_SET).withValueMin(0).withValueMax(1).withValueStep(0.01).withUnit('s').withDescription('Detection delay'),

    ],
    meta: {
        // All datapoints go in here
        tuyaDatapoints: [
		    [ 1, 'presence', tuya.valueConverter.trueFalse1],
			[ 2, 'radar_sensitivity', tuya.valueConverter.raw],
			[ 3, 'minimum_range', tuya.valueConverter.divideBy100],
			[ 4, 'maximum_range', tuya.valueConverter.divideBy100],
			[ 6, 'self_test', tuyaEnumConverter({'Pending': 0, 'Pass': 1, 'Fail': 2, 'Other': 3, 'Zigbee error': 4, 'Radar error': 5})],
			[ 9, 'distance', tuya.valueConverter.divideBy100],
			[ 101, 'detection_delay', tuya.valueConverter.divideBy10],
			[ 102, 'fading_time', tuya.valueConverter.divideBy10],
			[ 104, 'illuminance_lux', tuya.valueConverter.divideBy10],
			[ 105, 'radar_scene', tuya.valueConverter.raw],
			[ 106, 'border', tuya.valueConverter.divideBy100],
			[ 107, 'mode', tuyaEnumConverter({"standalone": 0, 'local': 1, 'manual':2, 'unavailable':3})],
			[ 108, 'state', tuyaEnumConverter({'off': 0, 'on': 1})],
			[ 109, 'indicator_led', tuyaEnumConverter({"off": 0, "on": 1})],
			[ 110, 'min_brightness', tuya.valueConverter.divideBy10],
			[ 111, 'reverse', tuyaEnumConverter({"normal open": 0, "normal close": 1})],
			[ 112, 'delay', tuya.valueConverter.divideBy10],
			[ 113, 'config_error', tuyaEnumConverter(
            {
                "none": 0,
                "invalid detection range reduce": 1,
                "invalid minimum detection range": 2,
                "invalid maximum detection range": 3,
                "switch unavailable": 4,
                "invalid inhibition time": 5,
                "switch polarity unsupported": 6
            })],
			[ 114, 'factory_reset', tuyaEnumConverter({'reset': 0})],
			[ 115, 'sensor_control', tuyaEnumConverter({'on': 0, 'off': 1, 'report occupy':2, 'report unoccupy':3})],
        ],
    },
};

const definition = [
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_cfcznfbz'}],
        model: 'MTG075-ZB2',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_iaeejhvf'}],
        model: 'MTG075-ZB2-RL',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_mtoaryre'}],
        model: 'MTG035-ZB2-RL',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_8s6jtscb'}],
        model: 'MTG035-ZB2',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_rktkuel1'}],
        model: 'MTD065-ZB2',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE200_mp902om5'}],
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_mp902om5'}],
        model: 'MTG075-ZB',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE200_w5y5slkq'}],
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_w5y5slkq'}],
        model: 'MTG275-ZB',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE200_dtzziy1e'}],
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_dtzziy1e'}],
        model: 'MTG275-ZB-RL',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE200_sbyx0lm6'}],
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_sbyx0lm6'}],
        model: 'MTG075-ZB-RL',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE200_clrdrnya'}],
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_clrdrnya'}],
        model: 'MTG235-ZB-RL',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE200_xnaqu2pc'}],
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_xnaqu2pc'}],
        model: 'MTD065-ZB',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE200_wk7seszg'}],
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_wk7seszg'}],
        model: 'MTG235-ZB',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE200_0wfzahlw'}],
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_0wfzahlw'}],
        model: 'MTD021-ZB',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE200_pfayrzcw'}],
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_pfayrzcw'}],
        model: 'MTG035-ZB-RL',
    },
    {
        ...commonDefinition,
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE200_z4tzr0rg'}],
        fingerprint: [{modelID: 'TS0601', manufacturerName: '_TZE204_z4tzr0rg'}],
        model: 'MTG035-ZB',
    }
];

module.exports = definition;