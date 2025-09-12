// TechTree

export const TechTree = {
    create() {
        return {
            woodcutter: {
                title: 'Woodcutters',
                description: 'Recruit villagers to gather wood.',
                perTurn: '-1 Meat\n+5 Wood',
                // Automatically handed out. Not necessarily because I want it that way,
                // more because it would take extra code bytes to handle the UI when
                // no jobs were unlocked yet.
                unlockCost: [],
                unlockCostText: '',
                x: 4, y: 4,
                sprite: 3,
                r: true, d: true, l: true, u: true
            },
            butcher: {
                title: 'Butchers',
                description: 'Recruit villagers to gather meat.',
                perTurn: '-1 Meat\n+5 Meat',
                unlockCost: [0, 0, 10],
                unlockCostText: '10 Wood',
                x: 4, y: 5,
                sprite: 4,
                d: true
            },
            tallower: {
                title: 'Tallowers',
                description: 'Recruit villagers to render fat and make torches.',
                perTurn: '-3 Meat\n-2 Wood\n+1 Torch',
                unlockCost: [0, 0, 10],
                unlockCostText: '10 Wood',
                x: 4, y: 6,
                sprite: 5,
                d: true
            },
            stonecutter: {
                title: 'Stonemasons',
                description: 'Recruit villagers to gather stone.',
                perTurn: '-1 Meat\n-1 Torch\n+5 Stone',
                unlockCost: [0, 0, 10],
                unlockCostText: '10 Wood',
                x: 4, y: 7,
                sprite: 6
            },
            sacrifice: {
                title: 'Sacrificial Lamb',
                description: 'Sacrifice villagers to temporarily increase sanity.',
                unlockCost: [0, 0, 10, 10, 10, 10],
                unlockCostText: '10 Wood\n10 Meat\n10 Torches\n10 Stone',
                perUse: '-1 Villager\n+10 Sanity',
                x: 3, y: 4,
                sprite: 8,
                l: true
            },
            cantor: {
                title: 'Cantors',
                description: 'Soothe the old ones with song and sacrifice.',
                unlockCost: [0, 0, 0, 0, 5, 5],
                unlockCostText: '5 Torches\n5 Stone',
                perTurn: '-3 Wood\n-4 Meat\n-1 Torch\n-3 Stone\n+1 Sanity',
                x: 2, y: 4,
                sprite: 7
            },
            ritual: {
                title: 'Ritual',
                description: 'Summon Freedom. Flames increase sanity drain.',
                unlockCost: [0, 0, 5, 5, 20, 5],
                unlockCostText: '5 Wood\n5 Meat\n20 Torches\n5 Stone',
                perUse: '-5 Wood\n-5 Meat\n-20 Torches\n-5 Stone',
                x: 4, y: 3,
                sprite: 6
            },
            woodplus: {
                title: 'Wood+',
                description: 'Gather 20% more wood.',
                perTurn: '+1 Wood',
                unlockCost: [0, 0, 10, 0, 0, 10],
                unlockCostText: '10 Wood\n10 Stone',
                x: 5, y: 4,
                r: true
            },
            woodplusplus: {
                title: 'Wood++',
                description: 'Gather 20% more wood.',
                perTurn: '+1 Wood',
                unlockCost: [0, 0, 30, 0, 0, 30],
                unlockCostText: '30 Wood\n30 Stone',
                x: 6, y: 4
            }
        };
    }
};
