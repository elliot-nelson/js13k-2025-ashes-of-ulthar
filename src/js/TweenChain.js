// TweenChain

export class TweenChain {
    constructor(tweenArray) {
        this.t = -1;
        this.tweenArray = tweenArray;
    }

    update() {
        this.t++;

        if (this.t < this.tweenArray[0].t1) {
            this.value = this.tweenArray[0].v1;
            this.facing = (this.tweenArray[0].v2 - this.tweenArray[0].v1 >= 0 ? 1 : 0);
            return;
        }

        if (this.t >= this.tweenArray[this.tweenArray.length - 1].t2) {
            this.value = this.tweenArray[this.tweenArray.length - 1].v2;
            this.facing = (this.tweenArray[this.tweenArray.length - 1].v2 - this.tweenArray[this.tweenArray.length - 1].v1 >= 0 ? 1 : 0);
            this.finished = true;
            return;
        }

        for (let i = 0; i < this.tweenArray.length; i++) {
            if (this.t >= this.tweenArray[i].t1 && this.t < this.tweenArray[i].t2) {
                // A tween chain can have an "undefined" start value, which means
                // just inherit the last value of the previous tween.
                if (this.tweenArray[i].v1 === undefined) {
                    this.tweenArray[i].v1 = this.tweenArray[i - 1].v2;
                }

                // Apply stagger on the fly; this allows for randomization of the DESTINATION
                // (we assume the start point does not move).
                if (this.tweenArray[i].stagger) {
                    this.tweenArray[i].v2 += Math.floor(Math.random() * this.tweenArray[i].stagger - this.tweenArray[i].stagger / 2);
                    this.tweenArray[i].stagger = undefined;
                }

                this.value = (this.tweenArray[i].v2 - this.tweenArray[i].v1)
                    * (this.t - this.tweenArray[i].t1)
                    / (this.tweenArray[i].t2 - this.tweenArray[i].t1)
                    + this.tweenArray[i].v1;

                // For every frame, we provide a utility "facing" value: 1 if the current
                // movement trends RIGHT, 0 if the current movement trends LEFT.
                this.facing = (this.tweenArray[i].v2 - this.tweenArray[i].v1 >= 0 ? 1 : 0);
                break;
            }
        }
    }
}
