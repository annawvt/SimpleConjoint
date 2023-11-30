
import { randomInt } from "./Utils.js";


/**
 * @class
 * @description Provides the data framework for a text based conjoint experiment. 
 */
class Conjoint{
    constructor(){
        this.factors = {}
    }

    /**
     * TODO Make it so that profiles are EXCLUSIVE 
     * TODO make it so that profiles have a code associated with them based on the recode.
     * @param {} count 
     * @returns 
     */
    select(count){
        let profiles = [];
        for(var i = 0; i < count; i++){
            profiles.push(this.randomProfile())
        }

        return profiles;
    }

    /**
     * @method
     * @description creates a factor using a list of level labels
     * @param {String} name - the name of the factor. 
     * @param {String[]} levelLabels - An array of strings that represent the levels, e.g. ["White", "Black", "Hispanic"] for the Race factor.
     */
    factor(name, levelLabels){
        this.factors[name] = levelLabels;
    }

    randomProfile(){
        let profile = {}; 
        for(var factor in this.factors){
            profile[factor] = this.randomLevel(factor);
        }
        return profile;
    }

    randomLevel(factor){
        let index = randomInt(0, factor.length);
        let label = this.labelAtIndex(factor, index);
        return {
            "index": index,
            "label": label
        }
    }

    labelAtIndex(factor, index){
        return this.factors[factor][index];
    }

}

let cj = new Conjoint();
cj.factor("Race", ["Black", "Hispanic", "White"])
cj.factor("Cheese", ["Cheddar", "Gouda", "American"])

console.log(cj.getRandomProfile())

