import dayjs from 'dayjs';
const NetworkDefaultTimezones = {
    "FB_Mnet": "UTC",
    "FB_MnetBing": "UTC",
    "FB_Enki": "UTC",
    "FB_System1": 'UTC',
    "FB_Rsoc": 'PDT',
    "FB_Tonic": 'PDT',
    "FB_DomainActive": "PDT",
    "FB_Bodies": "UTC",
    "FB_Bodies1": "UTC",
    "Newsbreak_DA": "PDT",
    "FB_Tonic1": "PDT",
    "FB_Sedo": "CET",
    "FB_TonicRsoc": "PDT",
    "FB_InuvoPrism": "PDT",
    "FB_CodeFuel": "UTC",
    "FB_Predicto": "EDT",
    "FB_Affinity": "PDT",
    "FB_Botup": "EDT",
    "Outbrain_TonicRsoc": "EDT",
    "FB_MWG": "UTC",
    "Taboola_Inuvoprism": "PDT"
}

const newtworkCollections = {
    "FB_Mnet": "Facebook_Mnet_Daily",
    "FB_MnetBing": "Facebook_MnetBing_Daily",
    "FB_Enki": "Facebook_Enki",
    "FB_System1": 'Facebook_System1',
    "FB_Rsoc": 'Facebook_Rsoc',
    "FB_Tonic": 'Facebook_Tonic',
    "FB_DomainActive": "Facebook_DActive_Names",
    "FB_Bodies": "Facebook_Bodies",
    "FB_Bodies1": "Facebook_Bodies1",
    "Newsbreak_DA": "Newsbreak_DomainActive",
    "FB_Tonic1": "Facebook_Tonic1",
    "FB_Sedo": "Facebook_Sedo",
    "FB_TonicRsoc": "Facebook_TonicRsoc",
    "FB_InuvoPrism": "Facebook_InuvoPrismDaily",
    "FB_CodeFuel": "Facebook_CodeFuel_Daily",
    "FB_Predicto": "Facebook_Predicto_Daily",
    "FB_Affinity": "Facebook_Affinity_Daily",
    "FB_Botup": "Facebook_Botup_Daily",
    "Outbrain_TonicRsoc": "Outbrain_TonicRsoc",
    "FB_MWG": "Facebook_Mwg_Daily",
    "Taboola_Inuvoprism": "Taboola_InuvoPrismDaily"
}

const revenuePartnerNames = {
    "MEDIA_DOT_NET": "FB_Mnet",
    "MEDIA_DOT_NET_BING": "FB_MnetBing",
    "Bodies": "FB_Bodies",
    "TONIC": "FB_Tonic",
    "TONIC1": "FB_Tonic1",
    "Domain Active": "FB_DomainActive",
    "ENKI": "FB_Enki",
    "System1": "FB_System1",
    "Domain_Active": "Newsbreak_DA",
    "Sedo": "FB_Sedo",
    "Tonic_Rsoc": "FB_TonicRsoc",
    "Inuvo_Prism": "FB_InuvoPrism",
    "Code_Fuel": "FB_CodeFuel",
    "Predicto": "FB_Predicto",
    "Affinity": "FB_Affinity",
    "Botup": "FB_Botup",
    "Outbrain_Tonic_Rsoc": "Outbrain_TonicRsoc",
    "MWG": "FB_MWG",
    "Taboola_Inuvoprism": "Taboola_Inuvoprism"
};
const timezones = [
    'UTC',
    'EEST',
    'EDT',
    'CST',
    'PDT',
    'IST',
    'BST',
    'GMT',
    'MST',
    'CDT',
    'AST',
    'DST',
    'CEST',
    'CET'
];
const rangePresets = [
    {
        label: 'Today',
        value: [dayjs().add(0, 'd'), dayjs().add(0, 'd')],
    },
    {
        label: 'Yesterday',
        value: [dayjs().add(-1, 'd'), dayjs().add(-1, 'd')],
    },
    {
        label: 'Last 7 Days',
        value: [dayjs().add(-7, 'd'), dayjs()],
    },
    {
        label: 'Last 14 Days',
        value: [dayjs().add(-14, 'd'), dayjs()],
    },
    {
        label: 'Last 30 Days',
        value: [dayjs().add(-30, 'd'), dayjs()],
    },
    {
        label: 'Last 60 Days',
        value: [dayjs().add(-60, 'd'), dayjs()],
    },
    {
        label: 'Last 90 Days',
        value: [dayjs().add(-90, 'd'), dayjs()],
    },
    {
        label: 'This Month',
        value: [dayjs().startOf('month'), dayjs()],
    },
    {
        label: 'Last Month',
        value: [
            dayjs().subtract(1, 'month').startOf('month'),
            dayjs().subtract(1, 'month').endOf('month'),
        ],
    },
];

export { NetworkDefaultTimezones, newtworkCollections, revenuePartnerNames, timezones, rangePresets }