// TechTree

export const TechTree = {
    create() {
        return {
            woodcutter: {
                title: 'Woodcutters',
                description: 'Recruit villagers to gather wood.',
                perTurn: '-1 Meat\n+5 Wood',
                unlockCost: '5 Meat',
                meat: 5,
                x: 2, y: 2,
                right: true,
                down: true
            },
            butcher: {
                title: 'Butchers',
                description: 'Recruit villagers to gather meat.',
                perTurn: '-1 Meat\n+5 Meat',
                unlockCost: '10 Wood',
                wood: 10,
                x: 2, y: 3,
                down: true
            },
            tallower: {
                title: 'Tallowers',
                description: 'Recruit villagers to render fat and make torches.',
                perTurn: '-3 Meat\n-2 Wood\n+1 Torch',
                unlockCost: '10 Wood',
                wood: 10,
                x: 2, y: 4,
                down: true
            },
            stonecutter: {
                title: 'Stonemasons',
                description: 'Recruit villagers to gather stone.',
                perTurn: '-1 Meat\n-1 Torch\n+5 Stone',
                unlockCost: '10 Wood',
                wood: 10,
                x: 2, y: 5
            },
            woodplus: {
                title: 'Wood+',
                description: 'Gather 20% more wood.',
                perTurn: '+1 Wood',
                unlockCost: '10 Wood 10 Stone',
                wood: 10,
                stone: 10,
                x: 3, y: 2,
                right: true
            },
            woodplusplus: {
                title: 'Wood++',
                description: 'Gather 20% more wood.',
                perTurn: '+1 Wood',
                unlockCost: '30 Wood 30 Stone',
                wood: 30,
                stone: 30,
                x: 4, y: 2
            }
        };
    }
};
