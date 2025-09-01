// GameScene

import { Audio } from './Audio';
import { Camera } from './Camera';
import { TARGET_GAME_HEIGHT, TARGET_GAME_WIDTH, INVENTORY_WOOD_POS, INVENTORY_MEAT_POS, INVENTORY_STONE_POS, INVENTORY_TORCH_POS, SANITY_POS } from './Constants';
import { game } from './Game';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { SacrificeParticle } from './SacrificeParticle';
import { Viewport } from './Viewport';
import { Button } from './Button';
import { Input } from './input/Input';
import { Villager, IDLE, BUTCHER, WOODCUTTER, TALLOWER, STONECUTTER, FIREKEEPER, TOTEMCARVER, SACRIFICE } from './Villager';
import { TextFloatParticle } from './TextFloatParticle';
import { Particle } from './Particle';

import { HelpScene } from './HelpScene';
import { DefeatScene } from './DefeatScene';

const BUTTON_RECRUIT_VILLAGER = 0;
const BUTTON_SACRIFICE_VILLAGER = 1;
const BUTTON_REPAIR_BRIDGE = 2;
const BUTTON_REPAIR_HALL = 3;
const BUTTON_REPAIR_ALTAR = 4;
const BUTTON_HELP = 5;

export class GameScene {
    constructor() {
        game.gameScene = this;
        this.entities = [];
        this.screenshakes = [];

        // Clock
        this.t = 0;
        this.influence = 5;
        this.sanity = 100;

        // Inventory
        this.meat = 0;
        this.wood = 0;
        this.stone = 0;
        this.torches = 0;

        // Playthrough Stats
        this.meatGathered = 0;
        this.woodGathered = 0;
        this.stoneGathered = 0;
        this.villagersRecruited = 0;
        this.torchesCrafted = 0;

        this.buttons = [];
        //this.buttons[BUTTON_RECRUIT_VILLAGER] = new Button((320-80)/2, 15, 'V', 'Recruit Villager');
        //this.buttons[BUTTON_SACRIFICE_VILLAGER] = new Button((320-80)/2, 15, 'S', 'Sacrifice Villager');
        this.buttons[BUTTON_RECRUIT_VILLAGER] = new Button(5, 3, 'V', 'Recruit Villager');
        this.buttons[BUTTON_SACRIFICE_VILLAGER] = new Button(5, 13, 'S', 'Sacrifice Villager');
        this.buttons[BUTTON_REPAIR_BRIDGE] = new Button(5, 23, 'B', 'REPAIR BRIDGE');
        this.buttons[BUTTON_REPAIR_HALL] = new Button(5, 33, 'T', 'REPAIR TALLOW HALL');
        this.buttons[BUTTON_REPAIR_ALTAR] = new Button(5, 43, 'A', 'BUILD ALTAR');
        this.buttons[BUTTON_HELP] = new Button(285, 168, 'H', 'HELP');
        this.buttons[BUTTON_HELP].visible = true;
        this.buttons[BUTTON_HELP].active = true;

        this.selectedJob = WOODCUTTER;
        this.jobsDisplayed = [WOODCUTTER];

        this.villagers = [];
        this.villagersWithJob = {
            [IDLE]: [],
            [BUTCHER]: [],
            [WOODCUTTER]: [],
            [TALLOWER]: [],
            [STONECUTTER]: [],
            [FIREKEEPER]: []
        };

        this.techBridge = false;
        this.techTorches = false;
        this.techStone = false;
        this.techAltar = false;
    }

    update() {
        // Set up displayed jobs
        if (this.techStone) {
            this.jobsDisplayed = [BUTCHER, WOODCUTTER, TALLOWER, STONECUTTER];
        } else if (this.techTorches) {
            this.jobsDisplayed = [BUTCHER, WOODCUTTER, TALLOWER];
        } else if (this.techBridge) {
            this.jobsDisplayed = [BUTCHER, WOODCUTTER];
        } else {
            this.jobsDisplayed = [WOODCUTTER];
        }

        if (this.torches > 0 && !this.techStone) {
            this.techStone = true;
        }

        // Player input

                // move
        ///this.pos.x += this.vel.x;
        ///this.pos.y += this.vel.y;

        if (Input.pressed[Input.Action.RECRUIT_VILLAGER]) {
            console.log(this.recruitVillager());
        }

        if (Input.pressed[Input.Action.BUILD_BRIDGE]) {
            console.log(this.buildBridge());
        }

        if (Input.pressed[Input.Action.BUILD_HALL]) {
            console.log(this.buildHall());
        }

        if (Input.pressed[Input.Action.BUILD_ALTAR]) {
            console.log(this.buildAltar());
        }

        if (Input.pressed[Input.Action.DOWN]) {
            this.moveJobSelector(1);
        }

        if (Input.pressed[Input.Action.UP]) {
            this.moveJobSelector(-1);
        }

        if (Input.pressed[Input.Action.RIGHT]) {
            console.log(this.hireVillager(this.selectedJob));
        }

        if (Input.pressed[Input.Action.LEFT]) {
            console.log(this.fireVillager(this.selectedJob));
        }

        if (Input.pressed[Input.Action.SACRIFICE]) {
            console.log(this.sacrificeVillager());
        }

        if (Input.pressed[Input.Action.JUMP]) {
            this.sanity -= 10;
        }

        if (Input.pressed[Input.Action.HELP]) {
            game.scenes.push(new HelpScene());
        }

        // Game ticks

        this.t++;

        if (!this.nextSanityTick) {
            this.nextSanityTick = this.t + 12;
        }

        if (this.t >= this.nextSanityTick) {
            this.sanity -= 0.2;
            this.influence += 0.2;
            this.nextSanityTick = this.t + 12;
        }

        if (this.t === 4) {
        //    Audio.play(Audio.levelStart);
        }

        // Button UI Elements

        this.buttons[BUTTON_RECRUIT_VILLAGER].active = (this.influence >= this.nextWorkerCost());
        this.buttons[BUTTON_RECRUIT_VILLAGER].visible = (this.villagersRecruited > 0 || this.buttons[BUTTON_RECRUIT_VILLAGER].active);

        this.buttons[BUTTON_SACRIFICE_VILLAGER].active = (true);
        this.buttons[BUTTON_SACRIFICE_VILLAGER].visible = (this.villagersRecruited > 0 || this.buttons[BUTTON_SACRIFICE_VILLAGER].active);

        this.buttons[BUTTON_REPAIR_BRIDGE].active = (this.wood >= 10);
        this.buttons[BUTTON_REPAIR_BRIDGE].visible = !this.techBridge && this.wood >= 10;

        this.buttons[BUTTON_REPAIR_HALL].active = (this.wood >= 10);
        this.buttons[BUTTON_REPAIR_HALL].visible = this.techBridge && !this.techTorches && this.wood >= 10;

        this.buttons[BUTTON_REPAIR_ALTAR].active = (this.stone >= 10);
        this.buttons[BUTTON_REPAIR_ALTAR].visible = this.techTorches && !this.techAltar && this.stone >= 10;

        let visibleButtonY = 3;
        for (let i = 0; i < 5; i++) {
            if (this.buttons[i].visible) {
                this.buttons[i].y = visibleButtonY;
                visibleButtonY += 10;
            }
        }

        // Villagers

        for (const villager of this.villagers) {
            villager.update();
        }

        // Entities

        for (const entity of this.entities) {
            entity.update();
        }
        this.entities = this.entities.filter(entity => !entity.cull);

        // Check

        if (this.sanity < 0) {
            this.playerLost();
        }
    }

    draw() {
        // Terrain

        Viewport.ctx.fillStyle = '#40985e';
        Viewport.ctx.fillRect(-5, 0, Viewport.width + 5, Viewport.height);

        Viewport.ctx.drawImage(Sprite.terrain[2].img, 0, 0);
        Viewport.ctx.drawImage(Sprite.terrain[1].img, 0, 0);
        Viewport.ctx.drawImage(Sprite.terrain[0].img, 0, 0);

        Viewport.ctx.drawImage(Sprite.blackcat[0].img, 160, 73 - 30);

        Viewport.ctx.fillStyle = '#0a1a2f';
        Viewport.ctx.fillRect(-5, Viewport.height - 31, Viewport.width + 5, 31);

        // Bridge

        if (this.techBridge) {
            Viewport.ctx.drawImage(Sprite.bridge[1].img, 112, 133 - 32);
        } else {
            Viewport.ctx.drawImage(Sprite.bridge[0].img, 112, 133 - 32);
        }

        // Tallower Hall

        if (this.techTorches) {
            Viewport.ctx.drawImage(Sprite.factory[1].img, 198, 133 - 32);
        } else {
            Viewport.ctx.drawImage(Sprite.factory[0].img, 198, 133 - 32);
        }

        // Altar

        if (this.techAltar) {
            let altarY = Math.floor(Math.sin(this.t / 25) * 2);
            Viewport.ctx.drawImage(Sprite.altar[0].img, 238, 116 - 30);
            Viewport.ctx.drawImage(Sprite.altar[1].img, 238, 115 - 30 + altarY);
        }

        if (true) {
            let crunk = String(Math.floor(this.sanity)) + ',' + String(Math.floor(this.influence)) + ',' + String(this.villagers.length);
            Text.drawText(Viewport.ctx, crunk, 3, 3, 1, Text.palette[1]);
        }

        for (const villager of this.villagers) {
            villager.draw();
        }

        if (game.scene === this) {
            // Hide button prompts if Help Screen is displayed, to avoid confusion
            for (const button of this.buttons) {
                button.draw();
            }
        }

        this.drawSanityBar();
        this.drawInfluenceBar();
        this.drawJobSelectUI();
        this.drawInventory();

        for (const entity of this.entities) {
            entity.draw();
        }
    }

    drawSanityBar() {
        let k = Math.floor((this.sanity / 100) * 78);
        Viewport.ctx.drawImage(Sprite.sanitybar[0].img, 320-18-5, -3);
        Viewport.ctx.drawImage(Sprite.sanitybar[1].img, 320-18-5, -3);
        Viewport.ctx.drawImage(Sprite.sanitybar[2].img,
            0, 2 + (78 - k),
            18, k,
            320-18-5, -3 + 2 + (78 - k),
            18, k
        );
    }

    drawInfluenceBar() {
        let k = Math.floor(Math.min(this.influence / this.nextWorkerCost(), 1) * 80);
        Viewport.ctx.drawImage(Sprite.influencebar[0].img, (320-80)/2, 3);
        Viewport.ctx.drawImage(Sprite.influencebar[1].img,
            2, 3,
            k, 4,
            (320-80)/2 + 2, 3 + 3,
            k, 4
        );
    }

    drawJobSelectUI() {
        const cornerX = 7;
        const cornerY = 120;
        const verticalMargin = 10;

        let selectedIdx = 0;

        for (let i = 0; i < this.jobsDisplayed.length; i++) {
            if (this.selectedJob === this.jobsDisplayed[i]) {
                selectedIdx = i;
            }

            const color = this.selectedJob === this.jobsDisplayed[i] ? Text.palette[3] : Text.palette[2];
            const numberText = String(this.villagersWithJob[this.jobsDisplayed[i]].length);
            const width = Text.measure(numberText).w;
            Text.drawText(Viewport.ctx, Villager.JOB_NAMES[this.jobsDisplayed[i]], cornerX + 5, cornerY + 4 + verticalMargin * i, 1, color);
            Text.drawText(Viewport.ctx, numberText, cornerX + 92 - width, cornerY + 4 + verticalMargin * i, 1, color);
        }

        const leftArrow = this.villagersWithJob[this.selectedJob].length > 0 ? 0 : 2;
        const rightArrow = this.villagersWithJob[IDLE].length > 0 ? 1 : 3;

        Viewport.ctx.drawImage(Sprite.jobselect[0].img, cornerX, cornerY + selectedIdx * verticalMargin);
        Viewport.ctx.drawImage(Sprite.smallarrows[leftArrow].img, cornerX + 77, cornerY + 4 + selectedIdx * verticalMargin);
        Viewport.ctx.drawImage(Sprite.smallarrows[rightArrow].img, cornerX + 94, cornerY + 4 + selectedIdx * verticalMargin);
    }

    drawInventory() {
        let woodWidth = Text.measure(String(this.wood), 1).w;
        let meatWidth = Text.measure(String(this.meat), 1).w;
        let stoneWidth = Text.measure(String(this.stone), 1).w;
        let torchWidth = Text.measure(String(this.torches), 1).w;

        Viewport.ctx.drawImage(Sprite.icons[0].img, INVENTORY_WOOD_POS.u - 60, INVENTORY_WOOD_POS.v - 1);
        Text.drawText(Viewport.ctx, 'WOOD', INVENTORY_WOOD_POS.u - 50, INVENTORY_WOOD_POS.v, 1, Text.palette[4]);
        Text.drawText(Viewport.ctx, String(this.wood), INVENTORY_WOOD_POS.u - woodWidth, INVENTORY_WOOD_POS.v, 1, Text.palette[4]);

        if (this.techBridge) {
            Viewport.ctx.drawImage(Sprite.icons[2].img, INVENTORY_MEAT_POS.u - 60, INVENTORY_MEAT_POS.v - 1);
            Text.drawText(Viewport.ctx, 'MEAT', INVENTORY_MEAT_POS.u - 50, INVENTORY_MEAT_POS.v, 1, Text.palette[4]);
            Text.drawText(Viewport.ctx, String(this.meat), INVENTORY_MEAT_POS.u - meatWidth, INVENTORY_MEAT_POS.v, 1, Text.palette[4]);
        }

        if (this.techTorches) {
            Viewport.ctx.drawImage(Sprite.icons[3].img, INVENTORY_TORCH_POS.u - 60, INVENTORY_TORCH_POS.v - 1);
            Text.drawText(Viewport.ctx, 'TORCHES', INVENTORY_TORCH_POS.u - 50, INVENTORY_TORCH_POS.v, 1, Text.palette[4]);
            Text.drawText(Viewport.ctx, String(this.torches), INVENTORY_TORCH_POS.u - torchWidth, INVENTORY_TORCH_POS.v, 1, Text.palette[4]);
        }

        if (this.techStone) {
            Viewport.ctx.drawImage(Sprite.icons[1].img, INVENTORY_STONE_POS.u - 60, INVENTORY_STONE_POS.v - 1);
            Text.drawText(Viewport.ctx, 'STONE', INVENTORY_STONE_POS.u - 50, INVENTORY_STONE_POS.v, 1, Text.palette[4]);
            Text.drawText(Viewport.ctx, String(this.stone), INVENTORY_STONE_POS.u - stoneWidth, INVENTORY_STONE_POS.v, 1, Text.palette[4]);
        }

    }

    addEntity(entity) {
        if (!entity.z) {
            entity.z = 1;
        }

        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].z > entity.z) {
                this.entities.splice(i, 0, entity);
                return;
            }
        }

        this.entities.push(entity);
    }

    addScreenShake(screenshake) {
        // This screen shake applies to the entire rendered screen, including GUI
        this.screenshakes.push(screenshake);
    }

    moveJobSelector(delta) {
        let idx = this.jobsDisplayed.indexOf(this.selectedJob);
        idx = (idx + delta + this.jobsDisplayed.length) % this.jobsDisplayed.length;
        this.selectedJob = this.jobsDisplayed[idx];
    }

    recruitVillager() {
        const cost = this.nextWorkerCost();
        if (this.influence >= cost) {
            this.influence -= cost;

            const villager = new Villager(this.selectedJob || WOODCUTTER);
            this.villagers.push(villager);
            this.villagersWithJob[villager.job].push(villager);
            this.villagersRecruited++;

            return true;
        }

        return false;
    }

    hireVillager() {
        if (this.villagersWithJob[IDLE].length > 0) {
            // TODO
            const villager = this.villagersWithJob[IDLE].pop();
            villager.job = this.selectedJob;
            this.villagersWithJob[this.selectedJob].push(villager);
            return true;
        }
        return false;
    }

    fireVillager() {
        if (this.villagersWithJob[this.selectedJob].length > 0) {
            // TODO
            const villager = this.villagersWithJob[this.selectedJob].pop();
            villager.job = IDLE;
            this.villagersWithJob[IDLE].push(villager);
            return true;
        }
        return false;
    }

    sacrificeVillager() {
        if (this.villagersWithJob[this.selectedJob].length > 0) {
            // TODO - pick right villager
            const villager = this.villagersWithJob[this.selectedJob].pop();

            this.villagers.splice(this.villagers.indexOf(villager), 1);

            this.entities.push(new SacrificeParticle(villager));

            //villager.job = SACRIFICE;
            //this.villagersWithJob[SACRIFICE].push(villager);
            //this.activeSacrifice = new SacrificeParticle();
            console.log('VILLAGER DEAD');
            return true;
        }
        return false;
    }

    consumeMeat() {
        if (this.meat > 0) {
            this.meat--;
            this.entities.push(new TextFloatParticle({ u: INVENTORY_MEAT_POS.u + 6, v: INVENTORY_MEAT_POS.v }, '-1', [4, 2]));
        } else {
            this.sanity--;
            this.entities.push(new TextFloatParticle({ u: SANITY_POS.u, v: SANITY_POS.v }, '-1', [0, 2]));
        }
    }

    grantSanity(value) {
        if (this.sanity < 100) {
            this.sanity = Math.min(100, this.sanity + value);
            this.entities.push(new TextFloatParticle({ u: SANITY_POS.u, v: SANITY_POS.v }, '+' + value, [0, 2]));
        }
    }

    gatherMeat() {
        this.meat += 5;
        this.meatGathered += 5;
        this.consumeMeat();
        this.entities.push(new TextFloatParticle({ u: INVENTORY_MEAT_POS.u + 6, v: INVENTORY_MEAT_POS.v }, '+5', [4, 2]));
    }

    gatherWood() {
        this.wood += 5;
        this.woodGathered += 5;
        this.consumeMeat();
        this.entities.push(new TextFloatParticle({ u: INVENTORY_WOOD_POS.u + 6, v: INVENTORY_WOOD_POS.v }, '+5', [4, 2]));
    }

    craftTorch() {
        this.torches += 1;
        this.torchesCrafted += 1;
        this.wood -= 2;
        this.meat -= 2;
        this.consumeMeat();
        this.entities.push(new TextFloatParticle({ u: INVENTORY_TORCH_POS.u + 6, v: INVENTORY_TORCH_POS.v }, '+1', [4, 2]));
        this.entities.push(new TextFloatParticle({ u: INVENTORY_WOOD_POS.u + 6, v: INVENTORY_WOOD_POS.v }, '-2', [4, 2]));
        this.entities.push(new TextFloatParticle({ u: INVENTORY_MEAT_POS.u + 6, v: INVENTORY_MEAT_POS.v }, '-2', [4, 2]));
    }

    gatherStone() {
        this.stone += 5;
        this.stoneGathered += 5;
        this.consumeMeat();
        this.entities.push(new TextFloatParticle({ u: 100, v: 100 }, '+5', [4, 2]));
        this.entities.push(new TextFloatParticle({ u: INVENTORY_STONE_POS.u + 6, v: INVENTORY_STONE_POS.v }, '+5', [4, 2]));
    }

    buildBridge() {
        const button = this.buttons[BUTTON_REPAIR_BRIDGE];

        if (button.active && button.visible && this.wood >= 10 && !this.techBridge) {
            this.wood -= 10;
            this.techBridge = true;
            this.entities.push(new TextFloatParticle({ u: INVENTORY_WOOD_POS.u + 6, v: INVENTORY_WOOD_POS.v }, '-10', [4, 2]));

            // TODO build bridge animation
        }
    }

    buildHall() {
        const button = this.buttons[BUTTON_REPAIR_HALL];

        if (button.active && button.visible && this.wood >= 10 && !this.techTorches) {
            this.wood -= 10;
            this.techTorches = true;
            this.entities.push(new TextFloatParticle({ u: INVENTORY_WOOD_POS.u + 6, v: INVENTORY_WOOD_POS.v }, '-10', [4, 2]));

            // TODO build hall animation
        }
    }

    buildAltar() {
        const button = this.buttons[BUTTON_REPAIR_ALTAR];

        if (button.active && button.visible && this.stone >= 10 && !this.techAltar) {
            this.stone -= 10;
            this.techAltar = true;
            this.entities.push(new TextFloatParticle({ u: INVENTORY_STONE_POS.u + 6, v: INVENTORY_STONE_POS.v }, '-10', [4, 2]));

            // TODO build altar animation
        }
    }

    nextWorkerCost() {
        return Math.floor(1 * Math.pow(1.3, this.villagers.length));
    }

    playerLost() {
        const stats = {
            seconds: Math.floor(this.t / 60),
            woodGathered: this.woodGathered,
            meatGathered: this.meatGathered,
            torchesCrafted: this.torchesCrafted,
            stoneGathered: this.stoneGathered,
        };
        game.scenes.pop();
        game.scenes.push(new DefeatScene(stats));
    }
}
