export let graphData = {
    nodes: [
        {label:"Funkturm-Charlottenburg"},
        {label:"Mahlwinkel"},
        {label:"Wasserwerk-Tangerhütte"},
        {label:"Sendestation-Tangermünde"},
        {label:"Alter-Wachturm-Rathenow"},
        {label:"Relaisstation-Nauen"},
        {label:"Aussichtsturm-Fehrbellin"},
        {label:"Funkmast-Dallgow-Döberitz"},
        {label:"Ruinen-am-Wannsee"},
        {label:"Königsroderhof-Fiener-Bruch"},
        {label:"Spielplatz-Bahnitz"},
        {label:"Havelsee"},
        {label:"Neuer-Friedhof-Ihleburg"},
        {label:"Brandenburg-an-der-Havel"},
        {label:"Berliner-Golfclub-Stolper-Heide"},
        {label:"Oranienburg"},
        {label:"Potsdam"},
        {label:"Botanischer-Volkspark-Blankenfelde-Pankow"},
        {label:"Schloss-Britz"},
        {label:"Rochow"},
        {label:"Schloss-Caputh"},
        {label:"Teltow"},
        {label:"Berlin-Alexanderplatz"}
    ],
    edges: [
    {
        "source": 2,
        "target": 1,
        "label": "7km",
        "risk": 2
    },
    {
        "source": 9,
        "target": 1,
        "label": "18km",
        "risk": 3
    },
    {
        "source": 3,
        "target": 2,
        "label": "18km",
        "risk": 2
    },
    {
        "source": 12,
        "target": 9,
        "label": "19km",
        "risk": 3
    },
    {
        "source": 10,
        "target": 9,
        "label": "25km",
        "risk": 2
    },
    {
        "source": 4,
        "target": 3,
        "label": "25km",
        "risk": 3
    },
    {
        "source": 11,
        "target": 4,
        "label": "15km",
        "risk": 4
    },
    {
        "source": 11,
        "target": 12,
        "label": "9km",
        "risk": 3
    },
    {
        "source": 10,
        "target": 12,
        "label": "8km",
        "risk": 2
    },
    {
        "source": 13,
        "target": 10,
        "label": "9km",
        "risk": 2
    },
    {
        "source": 13,
        "target": 11,
        "label": "13km",
        "risk": 3
    },
    {
        "source": 19,
        "target": 13,
        "label": "19km",
        "risk": 3
    },
    {
        "source": 20,
        "target": 19,
        "label": "24km",
        "risk": 4
    },
    {
        "source": 5,
        "target": 13,
        "label": "30km",
        "risk": 5
    },
    {
        "source": 6,
        "target": 4,
        "label": "40km",
        "risk": 3
    },
    {
        "source": 5,
        "target": 4,
        "label": "40km",
        "risk": 4
    },
    {
        "source": 15,
        "target": 6,
        "label": "30km",
        "risk": 3
    },
    {
        "source": 5,
        "target": 6,
        "label": "22km",
        "risk": 3
    },
    {
        "source": 7,
        "target": 5,
        "label": "14km",
        "risk": 4
    },
    {
        "source": 16,
        "target": 20,
        "label": "8km",
        "risk": 4
    },
    {
        "source": 8,
        "target": 16,
        "label": "8km",
        "risk": 4
    },
    {
        "source": 21,
        "target": 16,
        "label": "15km",
        "risk": 3
    },
    {
        "source": 0,
        "target": 21,
        "label": "12km",
        "risk": 3
    },
    {
        "source": 14,
        "target": 15,
        "label": "14km",
        "risk": 3
    },
    {
        "source": 14,
        "target": 7,
        "label": "20km",
        "risk": 3
    },
    {
        "source": 22,
        "target": 0,
        "label": "10km",
        "risk": 5
    },
    {
        "source": 14,
        "target": 17,
        "label": "18km",
        "risk": 4
    },
    {
        "source": 22,
        "target": 17,
        "label": "8km",
        "risk": 1
    },
    {
        "source": 22,
        "target": 18,
        "label": "16km",
        "risk": 2
    },
    {
        "source": 18,
        "target": 21,
        "label": "14km",
        "risk": 2
    },
    {
        "source": 0,
        "target": 8,
        "label": "14km",
        "risk": 3
    },
    {
        "source": 0,
        "target": 7,
        "label": "15km",
        "risk": 5
    }
]
};

export const geoDataRaw = `Name,Latitude,Longitude
Mahlwinkel,52.3831,11.8252
Sendestation-Tangermünde,52.5694,11.9702
Alter-Wachturm-Rathenow,52.6102,12.3392
Aussichtsturm-Fehrbellin,52.7845,12.8122
Berliner-Golfclub-Stolper-Heide,52.6828,13.2384
Botanischer-Volkspark-Blankenfelde-Pankow,52.5855,13.4309
Spielplatz-Bahnitz,52.4222,12.4414
Wasserwerk-Tangerhütte,52.4173,11.8988
Havelsee,52.4936,12.4284
Relaisstation-Nauen,52.6025,12.887
Funkmast-Dallgow-Döberitz,52.5458,13.0642
Funkturm-Charlottenburg,52.5065,13.2676
Neuer-Friedhof-Ihleburg,52.4442,12.3274
Königsroderhof-Fiener-Bruch,52.3683,12.0837
Rochow,52.2858,12.7214
Schloss-Caputh,52.3394,13.003
Ruinen-am-Wannsee,52.4147,13.1672
Schloss-Britz,52.4578,13.4682
Oranienburg,52.7533,13.2427
Brandenburg-an-der-Havel,52.4172,12.5592
Potsdam,52.3923,13.0645
Teltow,52.4042,13.2847
Berlin-Alexanderplatz,52.5219,13.4135`;

export const geoData = geoDataRaw.split('\n').slice(1).map(row => {
    const [Name, Latitude, Longitude] = row.split(',');
    return { Name, Latitude: +Latitude, Longitude: +Longitude };
});