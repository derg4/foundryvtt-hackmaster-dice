console.log("Hello world!!!");

/**
 * Get a random number from 1 to 'faces'. Used in penetrate().
 * @param {number} faces 
 * @return {number}
 */
function arbitrary_roll(faces) {
    const rand = CONFIG.Dice.randomUniform();
    return Math.ceil(rand * faces);
}

Hooks.on('init', () => {
    console.log("Hi! ========================================");
    /**
     * Adds the 'p' (for 'penetrate') modifier to die rolls.
     * This is similar to 'exploding' dice, but each 'exploded' die has 1 subtracted from it.
     * So, for a d6p, if you rolled 6, 6, 1, the total result would be 6+5+0=11.
     * d20p penetrate into d6p, d100p penetrate into d20p
     */
    Die.MODIFIERS['p'] = 'penetrate';
    Die.prototype.penetrate = function(modifier) {
        // Match the explode or "explode once" modifier
        const rgx = /[pP]/;
        const match = modifier.match(rgx);
        if ( !match ) return this;

        // Recursively explode until there are no remaining results to explode
        let i = 0;
        let new_results = [];

        while ( i < this.results.length ) {
            let r = this.results[i];
            new_results.push(r);
            i++;
            if (!r.active) continue;

            // Determine whether to explode the result and roll again!
            if ( this.faces > 1 && DiceTerm.compareResult(r.result, '=', this.faces) ) {
                r.exploded = true;

                let explode_faces = this.faces;
                if (this.faces == 100) explode_faces = 20
                else if (this.faces == 20) explode_faces = 6;

                while (true) {
                    let pen_result = arbitrary_roll(explode_faces) - 1;
                    let roll = {result: pen_result, active: true};

                    if (pen_result == explode_faces - 1) {
                        roll.exploded = true;
                        new_results.push(roll);
                    }
                    else {
                        new_results.push(roll);
                        break;
                    }
                }
            }
        }
        this.results = new_results;
    }
})