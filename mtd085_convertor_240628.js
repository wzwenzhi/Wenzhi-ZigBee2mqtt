const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const e = exposes.presets;
const ea = exposes.access;
const tuya = require('zigbee-herdsman-converters/lib/tuya');
const {Enum} = require('zigbee-herdsman-converters/lib/tuya');

const tzdatapoints = {
    ...tuya.tz.datapoints,
    key: ['cline', 'sensor', 'entry_distance', 'debug_mode', 'debug_distance', 'debug_countdown', 'distance_report_mode', ...tuya.tz.datapoints.key],
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
		toZigbee: [tzdatapoints],
        configure: async (device, coordinatorEndpoint) => {
            await tuya.configureMagicPacket(device, coordinatorEndpoint);
        },
        exposes: [            
            e.occupancy(), e.illuminance_lux(),
            e.numeric('target_distance', ea.STATE).withUnit('m')
				.withDescription('Distance to target'),
            e.numeric('radar_sensitivity', ea.STATE_SET).withValueMin(10).withValueMax(100).withValueStep(10).withUnit('%')
                .withDescription('Detection sensitivity'),
            e.numeric('maximum_range', ea.STATE_SET).withValueMin(1).withValueMax(10).withValueStep(0.1).withUnit('m')
                .withDescription('Maximum detection distance'),
            e.numeric('minimum_range', ea.STATE_SET).withValueMin(0.3).withValueMax(10).withValueStep(0.1).withUnit('m')
                .withDescription('Minimum detection distance'),
            e.numeric('entry_sensitivity', ea.STATE_SET).withValueMin(10).withValueMax(100).withValueStep(10).withUnit('%')
                .withDescription('Initial detection sensitivity when target enters range'),
            e.numeric('entry_distance', ea.STATE_SET).withValueMin(1).withValueMax(10).withValueStep(0.1).withUnit('m')
                .withDescription('Detection distance when unoccupied'),
            e.numeric('entry_filter_time', ea.STATE_SET).withValueMin(0).withValueMax(0.5).withValueStep(0.05).withUnit('s')
                .withDescription('Filter time for target entering range'),
            e.numeric('departure_delay', ea.STATE_SET).withValueMin(5).withValueMax(7200).withValueStep(1).withUnit('s')
                .withDescription('Confirmation time after target disappears'),
            e.numeric('block_time', ea.STATE_SET).withValueMin(0.5).withValueMax(10).withValueStep(0.1).withUnit('s')
                .withDescription('Time before target can be detected again after switching to unoccupied mode'),
            e.enum('status_indication', ea.STATE_SET, ['off', 'on'])
                .withDescription('Indicator light turns on when presence detected'),
            e.enum('sensor', ea.STATE_SET, ['normal', 'occupied', 'unoccupied'])
                .withDescription('Sensor output: detection result, force occupied, force unoccupied.'),
            e.enum('radar_scene', ea.STATE_SET, ['custom', 'toilet', 'kitchen', 'hallway', 'bedroom', 'livingroom', 'meetingroom', 'default'])
                .withDescription('Preset scenes'),
            e.enum('distance_report_mode', ea.STATE_SET, ['normal', 'occupancy detection'])
                .withDescription('Distance report mode. occupancy detection mode only report distance once when switching to occupied'),
            e.enum('debug_mode', ea.STATE_SET, ['off', 'on'])
                .withDescription('Debug mode for detailed information'),
            e.numeric('debug_distance', ea.STATE).withUnit('m')
				.withDescription('Real-time distance to target'),
            e.numeric('debug_countdown', ea.STATE).withUnit('s')
				.withDescription('Time before target disappears'),
			e.text('cline',ea.STATE_SET)
				.withDescription('Debug command line'),

        ],
        meta: {            
            tuyaSendCommand: 'sendData',
            tuyaDatapoints: [
                [101, 'entry_sensitivity', tuya.valueConverter.raw],
                [102, 'entry_distance', tuya.valueConverter.divideBy100],
                [103, 'departure_delay', tuya.valueConverter.raw],
                [104, 'entry_filter_time', tuya.valueConverter.divideBy100],
                [105, 'block_time', tuya.valueConverter.divideBy10],
                [106, 'device_type', tuya.valueConverter.raw],
                [107, 'illuminance_lux', tuya.valueConverter.divideBy10],
                [108, 'debug_mode', tuya.valueConverterBasic.lookup({'off': tuya.enum(0), 'on': tuya.enum(1)})],
                [109, 'debug_distance', tuya.valueConverter.divideBy100],
                [110, 'debug_countdown', tuya.valueConverter.raw],
                [111, 'radar_scene', tuya.valueConverterBasic.lookup({
                    'custom': tuya.enum(0), 
                    'toilet': tuya.enum(1), 
                    'kitchen': tuya.enum(2), 
                    'hallway': tuya.enum(3), 
                    'bedroom': tuya.enum(4), 
                    'livingroom': tuya.enum(5), 
                    'meetingroom': tuya.enum(6), 
                    'default': tuya.enum(7),
                })],
                [112, 'sensor', tuya.valueConverterBasic.lookup({
                    'normal': tuya.enum(0), 
                    'occupied': tuya.enum(1), 
                    'unoccupied': tuya.enum(2)
                })],
                [113, 'cline', tuya.valueConverter.raw],
                [114, 'status_indication', tuya.valueConverterBasic.lookup({'off': tuya.enum(0), 'on': tuya.enum(1)})],
                [115, 'radar_sensitivity', tuya.valueConverter.raw],
                [116, 'minimum_range', tuya.valueConverter.divideBy100],
                [117, 'maximum_range', tuya.valueConverter.divideBy100],
                [118, 'self_test', tuya.valueConverter.raw],
                [119, 'target_distance', tuya.valueConverter.divideBy100],
                [120, 'distance_report_mode', tuya.valueConverterBasic.lookup({
                    'normal': tuya.enum(0), 
                    'occupancy detection': tuya.enum(1)
                })],
            ],
        },
    },
];

module.exports = definition;
