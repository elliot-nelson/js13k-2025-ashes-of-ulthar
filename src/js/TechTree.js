// TechTree

export const TechTree = {
    create() {
        return {
            woodcutter: {
                title: 'Woodcutters',
                description: 'Recruit villagers to gather wood.',
                perTurn: '-1 Meat\n+5 Wood',
                unlockCost: [0, 0, 0, 5],
                unlockCostText: '5 Meat',
                x: 2, y: 2,
                sprite: 3,
                r: true, d: true, l: true
            },
            butcher: {
                title: 'Butchers',
                description: 'Recruit villagers to gather meat.',
                perTurn: '-1 Meat\n+5 Meat',
                unlockCost: [0, 0, 10],
                unlockCostText: '10 Wood',
                x: 2, y: 3,
                sprite: 4,
                d: true
            },
            tallower: {
                title: 'Tallowers',
                description: 'Recruit villagers to render fat and make torches.',
                perTurn: '-3 Meat\n-2 Wood\n+1 Torch',
                unlockCost: [0, 0, 10],
                unlockCostText: '10 Wood',
                x: 2, y: 4,
                sprite: 5,
                d: true
            },
            stonecutter: {
                title: 'Stonemasons',
                description: 'Recruit villagers to gather stone.',
                perTurn: '-1 Meat\n-1 Torch\n+5 Stone',
                unlockCost: [0, 0, 10],
                unlockCostText: '10 Wood',
                x: 2, y: 5,
                sprite: 6
            },
            sacrifice: {
                title: 'Sacrificial Lamb',
                description: 'Sacrifice villagers to temporarily increase sanity.',
                unlockCost: [0, 0, 10, 10, 10, 10],
                unlockCostText: '10 All Resources',
                perUse: '-1 Villager\n+10 Sanity',
                x: 1, y: 2,
                sprite: 6,
                l: true
            },
            cantor: {
                title: 'Cantors',
                description: 'Soothe the old ones.',
                unlockCost: [0, 0, 0, 0, 5, 5],
                unlockCostText: '5 Torches 5 Stone',
                perTurn: '-3 All Resources\n+1 Sanity',
                x: 0, y: 2,
                sprite: 6,
                l: true
            },
            ritual: {
                title: 'Ritual',
                description: 'Start the ritual and light the seven seals. WARNING: Seals will gradually drain village sanity.',
                unlockCost: [0, 0, 5, 5, 20, 5],
                unlockCostText: '5 Wood 5 Meat\n20 Torches 5 Stone',
                perUse: '-5 Wood\n-5 Meat\n-20 Torches\n-5 Stone',
                x: -1, y: 2,
                sprite: 6
            },
            woodplus: {
                title: 'Wood+',
                description: 'Gather 20% more wood.',
                perTurn: '+1 Wood',
                unlockCost: [0, 0, 10, 0, 0, 10],
                unlockCostText: '10 Wood 10 Stone',
                x: 3, y: 2,
                r: true
            },
            woodplusplus: {
                title: 'Wood++',
                description: 'Gather 20% more wood.',
                perTurn: '+1 Wood',
                unlockCost: [0, 0, 30, 0, 0, 30],
                unlockCostText: '30 Wood 30 Stone',
                x: 4, y: 2
            }
        };
    }
};
