// TechTree

export const TechTree = {
    create() {
        return {
            // Job path
            woodcutter: {
                title: 'Woodcutters',
                description: 'Recruit villagers to gather wood.',
                perTurn: '-1 Meat\n+5 Wood',
                // Automatically handed out. Not necessarily because I want it that way,
                // more because it would take extra code bytes to handle the UI when
                // no jobs were unlocked yet.
                unlockCost: [],
                x: 4, y: 4,
                sprite: 3,
                r: true, d: true, l: true, u: true
            },
            butcher: {
                title: 'Butchers',
                description: 'Recruit villagers to gather meat.',
                perTurn: '-1 Meat\n+5 Meat',
                unlockCost: [0, 0, 10],
                x: 4, y: 5,
                sprite: 4,
                d: true
            },
            tallower: {
                title: 'Tallowers',
                description: 'Recruit villagers to render fat and make torches.',
                perTurn: '-3 Meat\n-2 Wood\n+1 Torch',
                unlockCost: [0, 0, 10, 10],
                x: 4, y: 6,
                sprite: 5,
                d: true, r: true
            },
            stonecutter: {
                title: 'Stonemasons',
                description: 'Recruit villagers to gather stone.',
                perTurn: '-1 Meat\n-1 Torch\n+5 Stone',
                unlockCost: [0, 0, 20, 20],
                x: 4, y: 7,
                sprite: 6,
                r: true,
                d: true
            },
            cantor: {
                title: 'Cantors',
                description: 'Soothe the old ones with song and sacrifice.',
                unlockCost: [0, 0, 40, 40],
                perTurn: '-3 Wood\n-4 Meat\n-1 Torch\n-3 Stone\n+1 Sanity',
                x: 4, y: 8,
                sprite: 7,
                r: true
            },

            // Sanity path
            sacrifice: {
                title: 'Sacrificial Lamb',
                description: 'Sacrifice villagers to temporarily increase sanity. Long cooldown.',
                unlockCost: [0, 0, 25, 25, 5, 25],
                perUse: '-1 Villager\n+10 Sanity',
                x: 3, y: 4,
                sprite: 8,
                l: true
            },
            sanityplus: {
                title: 'Resolute',
                description: 'The village is more resilient.',
                unlockCost: [0, 0, 0, 0, 50],
                perTurn: 'Reduce all sanity drain by 25%',
                x: 2, y: 4,
                sprite: 7,
                d: true
            },
            sanityplusplus: {
                title: 'Resolute+',
                description: 'The village is even more resilient.',
                unlockCost: [0, 0, 0, 0, 70],
                perTurn: 'Reduce all sanity drain by 50%',
                x: 2, y: 5,
                sprite: 7
            },

            // Ritual path
            ritual: {
                title: 'Ritual',
                description: 'Summon Freedom. Flames increase sanity drain.',
                unlockCost: [0, 0, 5, 5, 20, 5],
                perUse: '-5 Wood\n-5 Meat\n-20 Torches\n-5 Stone',
                x: 4, y: 3,
                sprite: 6
            },

            // Wood upgrades
            woodplus: {
                title: 'Screaming Trees',
                description: 'Woodcutters bring back 20% more wood.',
                perTurn: '+1 Wood',
                unlockCost: [0, 0, 20, 0, 0, 20],
                x: 5, y: 4,
                r: true
            },

            // Stone upgrades
            stoneplus: {
                title: 'Stone Cold',
                description: 'Stonemasons bring back 20% more stone.',
                perTurn: '+1 Stone',
                unlockCost: [0, 0, 20, 0, 0, 20],
                x: 5, y: 7
            },

            // Tallower upgrades
            torchplus: {
                title: 'Hallowed',
                description: 'Tallower torch production is doubled.',
                perTurn: '+1 Torch',
                unlockCost: [0, 0, 40, 40],
                x: 5, y: 6,
                sprite: 7
            },

            // Cantor upgrades
            cantorplus: {
                title: 'Chorus',
                description: 'Cantor sanity gain is doubled.',
                perTurn: '+1 Sanity',
                unlockCost: [0, 0, 40, 40, 40, 40],
                x: 5, y: 8,
                sprite: 7
            }
        };
    }
};
