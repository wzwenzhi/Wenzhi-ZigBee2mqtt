const exposes = require('zigbee-herdsman-converters/lib/exposes');
const e = exposes.presets;
const ea = exposes.access;
const tuya = require('zigbee-herdsman-converters/lib/tuya');

// 扩展自定义数据点
const tzDatapoints = {  
    ...tuya.tz.datapoints,  
    key: Array.isArray(tuya.tz.datapoints.key)   
        ? [...tuya.tz.datapoints.key, ...Array.from({length: 11}, (_, i) => `gate_enable_${String(i+1).padStart(2, '0')}`),
            'thr_cfg_range_gate', 'motion_thr', 'presence_thr', 'nearest_target_gate',
            'target_countdown', 'target_velocity', 'debug_switch', 'led_mode', 'delay_time',
            'block_time', 'judge_alg', 'env_noise_collect', 'device_control', 'p_sensitivity',
            'm_sensitivity', 'scene_mode', 'illum_report_sw', 'motion_detec_sw', 'dist_report_sw', 'speed_report_sw'
        ] 
        : [...Array.from({length: 11}, (_, i) => `gate_enable_${String(i+1).padStart(2, '0')}`),
            'thr_cfg_range_gate', 'motion_thr', 'presence_thr', 'nearest_target_gate',
            'target_countdown', 'target_velocity', 'debug_switch', 'led_mode', 'delay_time',
            'block_time', 'judge_alg', 'env_noise_collect', 'device_control', 'p_sensitivity',
            'm_sensitivity', 'scene_mode', 'illum_report_sw', 'motion_detec_sw', 'dist_report_sw', 'speed_report_sw'
        ]
};  

const definition = [
    {
        fingerprint: tuya.fingerprint('TS0601', ['_TZE284_aai5grix']),
        model: 'MTD285-ZB',
        vendor: 'Wenzhi',
        description: 'Human Presence Sensor',
        fromZigbee: [tuya.fz.datapoints],
        toZigbee: [tuya.tz.datapoints, tzDatapoints], // 包含自定义数据点
        configure: tuya.configureMagicPacket,
        exposes: [
            e.presence().withDescription('Presence state'),
            e.illuminance().withDescription('Measured illuminance'),
            e.numeric('near_detection', ea.STATE_SET).withValueMin(0).withValueMax(8.4).withUnit('m').withDescription('Near detection distance'),
            e.numeric('far_detection', ea.STATE_SET).withValueMin(0).withValueMax(8.4).withUnit('m').withDescription('Far detection distance'),
            e.numeric('target_dis_closest', ea.STATE).withValueMin(0).withValueMax(9.9).withUnit('m').withDescription('Closest target distance'),
            ...Array.from({length: 11}, (_, i) => 
                e.enum(`gate_enable_${String(i+1).padStart(2, '0')}`, ea.STATE_SET, ['disable', 'enable']).withDescription(`Distance gate ${i+1} enable`)),
            e.numeric('thr_cfg_range_gate', ea.STATE_SET).withValueMin(1).withValueMax(11).withDescription('Threshold configuration gate'),
            e.numeric('motion_thr', ea.STATE_SET).withValueMin(0).withValueMax(99).withDescription('Motion detection threshold'),
            e.numeric('presence_thr', ea.STATE_SET).withValueMin(0).withValueMax(99).withDescription('Presence detection threshold'),
            e.numeric('nearest_target_gate', ea.STATE).withValueMin(0).withValueMax(11).withDescription('Nearest active gate'),
            e.numeric('target_countdown', ea.STATE).withValueMin(0).withValueMax(3600).withUnit('s').withDescription('Target timeout countdown'),
            e.numeric('target_velocity', ea.STATE).withValueMin(-9.99).withValueMax(9.99).withUnit('m/s').withDescription('Target velocity with direction'),
            e.enum('debug_switch', ea.STATE_SET, ['debug_off', 'debug_on']).withDescription('Debug mode toggle'),
            e.enum('led_mode', ea.STATE_SET, ['silence', 'debug']).withDescription('LED indicator mode'),
            e.numeric('delay_time', ea.STATE_SET).withValueMin(5).withValueMax(3600).withUnit('s').withDescription('Departure delay time'),
            e.numeric('block_time', ea.STATE_SET).withValueMin(0).withValueMax(10).withUnit('s').withDescription('Block time after unoccupancy'),
            e.enum('judge_alg', ea.STATE_SET, ['large_move', 'small_move', 'custom_move']).withDescription('Presence detection algorithm'),
            e.enum('env_noise_collect', ea.STATE_SET, ['start', 'ongoing', 'complete']).withDescription('Environmental noise collection status'),
            e.enum('device_control', ea.STATE_SET, ['no_action', 'restart', 'reset_param']).withDescription('Device control commands'),
            e.enum('p_sensitivity', ea.STATE_SET, ['high', 'midst', 'low', 'custom']).withDescription('Presence sensitivity'),
            e.enum('m_sensitivity', ea.STATE_SET, ['high', 'midst', 'low', 'custom']).withDescription('Motion sensitivity'),
            e.enum('scene_mode', ea.STATE_SET, ['deault', 'toilet', 'kitchen', 'corridor', 'bedroom', 'living_room', 'conference']).withDescription('Scene mode preset'),
            e.binary('illum_report_sw', ea.STATE_SET, 'on', 'off').withDescription('Illuminance reporting toggle'),
            e.binary('motion_detec_sw', ea.STATE_SET, 'on', 'off').withDescription('Motion detection toggle'),
            e.binary('dist_report_sw', ea.STATE_SET, 'on', 'off').withDescription('Distance reporting toggle'),
            e.binary('speed_report_sw', ea.STATE_SET, 'on', 'off').withDescription('Speed reporting toggle'),
        ],
        meta: {
            tuyaDatapoints: [
                [1, 'presence', tuya.valueConverterBasic.lookup({'none': tuya.enum(0), 'presence': tuya.enum(1), 'motion': 2})],
                [3, 'near_detection', tuya.valueConverter.divideBy10],  // 倍数1 -> /10
                [4, 'far_detection', tuya.valueConverter.divideBy10],   // 倍数1 -> /10
                [9, 'target_dis_closest', tuya.valueConverter.divideBy10], // 倍数1 -> /10
                ...Array.from({length: 11}, (_, i) => [101 + i, `gate_enable_${String(i+1).padStart(2, '0')}`, tuya.valueConverterBasic.lookup({'disable': tuya.enum(0), 'enable': tuya.enum(1)})]),
                [112, 'thr_cfg_range_gate', tuya.valueConverter.raw],
                [113, 'motion_thr', tuya.valueConverter.raw],
                [114, 'presence_thr', tuya.valueConverter.raw],
                [115, 'nearest_target_gate', tuya.valueConverter.raw],
                [116, 'target_countdown', tuya.valueConverter.raw],
                [117, 'target_velocity', tuya.valueConverter.divideBy100], // 倍数2 -> /100
                [118, 'debug_switch', tuya.valueConverterBasic.lookup({'debug_off': tuya.enum(0), 'debug_on': tuya.enum(1)})],
                [119, 'led_mode', tuya.valueConverterBasic.lookup({'silence': tuya.enum(0), 'debug': tuya.enum(1)})],
                [120, 'delay_time', tuya.valueConverter.raw],
                [121, 'block_time', tuya.valueConverter.divideBy10],
                [122, 'judge_alg', tuya.valueConverterBasic.lookup({'large_move': tuya.enum(0), 'small_move': tuya.enum(1), 'custom_move': 2})],
                [123, 'env_noise_collect', tuya.valueConverterBasic.lookup({'start': tuya.enum(0), 'ongoing': tuya.enum(1), 'complete': 2})],
                [124, 'device_control', tuya.valueConverterBasic.lookup({'no_action': tuya.enum(0), 'restart': tuya.enum(1), 'reset_param': 2})],
                [125, 'illuminance', tuya.valueConverter.raw], 
                [126, 'p_sensitivity', tuya.valueConverterBasic.lookup({'high': tuya.enum(0), 'midst': tuya.enum(1), 'low': tuya.enum(2), 'custom': 3})],
                [127, 'm_sensitivity', tuya.valueConverterBasic.lookup({'high': tuya.enum(0), 'midst': tuya.enum(1), 'low': tuya.enum(2), 'custom': 3})],
                [128, 'scene_mode', tuya.valueConverterBasic.lookup({
                    'deault': tuya.enum(0), 'toilet': tuya.enum(1), 'kitchen': tuya.enum(2), 'corridor': tuya.enum(3), 'bedroom': tuya.enum(4), 'living_room': tuya.enum(5), 'conference': tuya.enum(6)})],
                [129, 'illum_report_sw', tuya.valueConverterBasic.lookup({'off': tuya.enum(0), 'on': tuya.enum(1)})],
                [130, 'motion_detec_sw', tuya.valueConverterBasic.lookup({'off': tuya.enum(0), 'on': tuya.enum(1)})],
                [131, 'dist_report_sw', tuya.valueConverterBasic.lookup({'off': tuya.enum(0), 'on': tuya.enum(1)})],
                [132, 'speed_report_sw', tuya.valueConverterBasic.lookup({'off': tuya.enum(0), 'on': tuya.enum(1)})],
            ],
        },
    },
];

module.exports = definition;
