var FACTORS = {
    "Race": ["Black", "Hispanic", "White"],
    "Sex" : ["Male", "Female"],
    "Age" : ["20", "35"],
    "Offense": ["Theft less than $2,000", "Simple assault"],
    "Prior Record": ["None", "Simple possession of marijuana"]
}

/**
 * @function 
 * @description Chooses a random integer between the minimum and the maximum.
 * @param {Number} min The minimum value. Must be an integer.
 * @param {Number} max The maximum value. Must be an integer.
 * @returns {Number} A number between min (inclusive) and max(exclusive).
 */
function randomInt(min, max){
    return Math.floor(Math.random()*(max-min) + min);
}

/**
 * @function
 * @description Chooses a random element from the provided array.
 * @param {Array} arr 
 * @returns a randomly selected element from arr. 
 */
function chooseRandomElement(arr){
    var index = randomInt(0, arr.length);
    return {
        index: index,
        value: arr[index]
    }
}

/**
 * @class
 * @description A class that represents a single profile containing factors.
 * @property {Object} factors An object where each key is a name of a factor and
 * its corresponding value is an array containing the labels for that factor.
 */
class Profile{
    static factors = {};

    /**
     * @static
     * @description Sets the factors from which profiles are generated.
     * @param {Object} factors An object where each key is a name of a factor and
     * its corresponding value is an array containing the labels for that factor.
     */
    static setFactors(factors){
        this.factors = factors;
    }

    /**
     * @static 
     * @description Generates a single profile by selecting random values for each factor.
     * @returns {Profile} a profile.
     */
    static generate(){

        var factorSet = {};

        for(var [name, arr] of Object.entries(Profile.factors)){
            factorSet[name] = chooseRandomElement(arr); 
        }

        return new Profile(factorSet);
    }

    /**
     * @static 
     * @description Generates and array of n unique profiles.
     * @param {Number} n The number of profiles to generate. Must be an integer. 
     * @returns {Profile[]} an Array of unique profiles.
     */
    static generateMultiple(n, unique = true){
        var out = [];
        var prof;
        var generateMethod = unique ? Profile.generateUnique.bind(null, out) : Profile.generate

        for(var i = 0; i < n; i++){
            
            try{
                prof = generateMethod(); 
            }
            catch(e){
                console.warn("Only "+(i)+" unique profiles could be generated.")
                break;
            }
            out.push(prof)
            
        }
        return out;
    }

    /**
     * @description Generates a single profile that is unique from all profiles in current.
     * @param {Profile[]} current the current set of profiles to compare against for uniqueness.
     * @returns {Profile} a unqiue profile.
     */
    static generateUnique(current){
        //uses instance's toString method to test for uniqueness.
        var prof;
        var iterationLimit = 500;
        var curStrings = current.map(e=>e.toString())
        var currentContains = (profile) => curStrings.some(e=>e==profile.toString())
        var iterations = 0;

        //Iterations prevents runaway, assumes 100 fails means no more unique profiles exist.
        while(iterations < iterationLimit){
            prof = Profile.generate();

            //Continues to next loop if this profile is not unique.
            if(currentContains(prof)){
                iterations++;
                continue;
            }

            //exits loop if profile is unique.
            break;
        }

        //If iteration limit reached, throw error. otherwise, return profile. 
        if(iterations == iterationLimit){
            throw new Error("Could not generate new unique profile. Failed after 100 attempts.")
        }

        return prof;

        
       
    }

    /**
     * 
     * @param {Object} factors generate a profile from an object where the keys are factor names and the values are a specific factor level.
     */
    constructor(factors) {
        for(var factor in factors){
            this[factor] = factors[factor];
        }
    }

    /**
     * @description converts this profile to a string. Useful for comparison of equality.
     * @returns {String} a string wherein the factor names are joined with the factor label indices, one after another.
     */
    toString(){
        var str = Object.keys(this).join("") + Object.values(this).map(e=>e.index).join("")
        return str;
    }

    /**
     * @description Get only the labels for the factor level.
     * @returns {Object} an object where keys are factor names and values are the selected label for that factor.
     */
    labels(){
        var out = {};
        for(var [key, val] of Object.entries(this)){
            out[key] = val.value
        }
        return out;
    }

    /**
     * @description get only the indec of each factor level.
     * @returns {Object} an object where keys are factor names and values are the index of the selected label for that factor.
     */
    indices(){
        var out = {};
        for(var [key, val] of Object.entries(this)){
            out[key] = val.index
        }
        return out;
    }
 

}

/**
 * 
 * @param {Profile} profile the profile to convert
 * @returns a jQuery object containing and HTML table with factors and labels listed side by side.
 */
function profileToTable(profile){
    var labels = profile.labels();
    var tr;
    var tableBody = jQuery("<tbody></tbody>");

    for(var [factor, label] of Object.entries(labels)){
        tr = "<tr>";
        tr += "<td>"+factor+"</td>";
        tr += "<td>"+label+"</td>";
        tr += "</tr>";
        jQuery(tr).appendTo(tableBody);
    }

    return jQuery("<table class='profile'></table>").append(tableBody);

    
}

/**
 * @description For each element on the page with a the profileTarget class,
 * replace it with the profile referenced by the profileindex data field.
 * @param {Profile[]} profiles - the array of profiles to use when replacing targets.
 */
function replaceTargets(profiles){

    jQuery(".profileTarget").each(function(i, e){
        var profileIndex = jQuery(e).data("profileindex");
        
        var profile;
        if(Number.isInteger(profileIndex)){
            profile = profiles[parseInt(profileIndex)]
            profile = profileToTable(profile); 
            console.info("Loading profile #"+profileIndex)
            jQuery(e).replaceWith(profile);
        }
        else {
            console.warn(profileIndex+" is not a valid profile index.")
        }
    })

}

function closeout(profiles){
    for(var[profile, index] in profiles){
        Qualtrics.SurveyEngine.setEmbeddedData("Profile "+index, JSON.stringify(profile))
    }
}

//Set the factors to be used for generating profiles. 
Profile.setFactors(FACTORS);

var profiles;
//only generate profiles first time, then save to embedded data. 
try{
    profiles = JSON.parse(Qualtrics.SurveyEngine.getJSEmbeddedData("profiles"));

    //convert the plain object from the json into actual profiles.
    profiles = profiles.map(e=>new Profile(e))
}
catch(e){
    console.warn(e)

    //generate 12 profiles, enforce uniqueness.
    profiles = Profile.generateMultiple(12, true);
    Qualtrics.SurveyEngine.setJSEmbeddedData("profiles", JSON.stringify(profiles));
    Qualtrics.SurveyEngine.setEmbeddedData("profiles", JSON.stringify(profiles));
}

//Replace the targets with the desired profiles.
replaceTargets(profiles);


