const csv = require('csv-parser');
const fs = require('fs');
const EDO = require('./edo').EDO
const make_audio = require("./make_audio")


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const edo = new EDO(12)


const load_json = function (path="5-note-sets.json") {
    return JSON.parse(fs.readFileSync(path,{encoding:'utf8', flag:'r'}))

}
const make_csv = function (participant_id,participant_dir,block_num,stimuli) {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: participant_dir + "csv/" + "block_" + block_num + ".csv",
        header: [
            {id: 'subject_id', title: 'Subject ID'}, //OVS...
            {id: 'block_num', title: 'Block Number'}, //1-...
            {id: 'probe_type', title: 'Probe Type'}, // diatonic / chromatic
            {id: 'option_1', title: 'Option 1'}, // swapped / shifted
            {id: 'option_2', title: 'Option 2'}, // swapped / shifted
            {id: 'melody', title: 'Probe Pitches'},
            {id: 'melody_dist', title: 'Mel Pitch Distribution'},
            {id: 'swapped_pitches', title: 'swapped Pitches'},
            {id: 'swapped_dist', title: 'Swa Pitch Distribution'},
            {id: 'shifted_pitches', title: 'Shifted Pitches'},
            {id: 'shifted_dist', title: 'Shi Pitch Distribution'},
            {id: 'has_decoy', title: 'Has Decoy'},
            {id: 'decoy_position', title: 'Decoy Position'},
            {id: 'set', title: 'Pitch Set'},
            {id: 'transposition', title: 'Transposition'},
            {id: 'transposed_set', title: 'Transposed Set'},
        ]
    });

    stimuli = stimuli.map((stim,i) => {
        let option1 = stim.order[0]
        let option2 = stim.order[1]
        stim.probe_file = "Block-" + block_num + "-Q-" + (i+1) + "-000-"+ stim.type + "-probe.mp3"
        stim.option_1_file = "Block-" + block_num + "-Q-" + (i+1) + "-001-"+ stim.type + "-" + option1 + ".mp3"
        stim.option_2_file = "Block-" + block_num + "-Q-" + (i+1) + "-002-"+ stim.type + "-" + option2 + ".mp3"
        return stim
    })



    fs.writeFile(participant_dir + "csv/" + "block_" + block_num + ".json", JSON.stringify(stimuli), function(err) {
        if(err) {
            return console.log(err);
        }
    });

    let data =stimuli.map((stim,i) => {
        let option1 = stim.order[0]
        let option2 = stim.order[1]
        let dat = {
            subject_id: participant_id,
            block_num: block_num,
            probe_type: stim.type,
            shift_dir: stim.shift_dir,
            melody: stim.melody,
            melody_dist: JSON.stringify(stim.melody_dist),
            swapped_pitches: stim.swapped,
            swapped_dist: JSON.stringify(stim.swapped_dist),
            shifted_pitches: stim.shifted,
            shifted_dist: JSON.stringify(stim.shifted_dist),
            option_1: option1,
            option_2: option2,
            has_decoy: stim.has_decoy,
            decoy_position: stim.decoy_position,
            set: stim.pitches,
            transposition: stim.transposition,
            transposed_set: stim.transposed_pitches
        }

        return dat
    })


    csvWriter
        .writeRecords(data)
        .then(()=> console.log("CSV file subject",participant_id,"block", block_num,"was successfully created."));
}

const make_block = function (participant_id,participant_dir,block_num,stimuli) {

    for(let i=0;i<stimuli.length;i++) {
        let stimulus = stimuli[i]
        let shift_ord
        let swapped_ord

        if(stimulus.order[0]=="swapped") {
            swapped_ord=1
            shift_ord=2
        } else if (stimulus.order[0]=="shifted") {
            swapped_ord=2
            shift_ord=1
        }
        /*Generate audio files for each stimulus (probe, swapped, and shifted)*/
        make_audio(stimulus.melody, participant_dir + "audio/" + "Block-" + block_num + "-Q-" + (i + 1) + "-000-" + stimulus.type + '-probe.mp3')
        make_audio(stimulus.swapped, participant_dir + "audio/" + "Block-" + block_num + "-Q-" + (i + 1) + "-00" + swapped_ord + "-" + stimulus.type + '-swapped.mp3')
        make_audio(stimulus.shifted, participant_dir + "audio/" + "Block-" + block_num + "-Q-" + (i + 1) + "-00" + shift_ord + "-" + stimulus.type + '-shifted.mp3')
    }
    /*Generate a CSV for the block*/
    make_csv(participant_id,participant_dir,block_num,stimuli)
}

const make_directories = function (participant_id,root_dir="./Task_Sets/") {
    const participant_dir = root_dir + participant_id + "/"

    /*Make subject folder*/
    if (!fs.existsSync(participant_dir)) fs.mkdirSync(participant_dir)

    /*Make subject audio folder*/
    if (!fs.existsSync(participant_dir + "audio")) fs.mkdirSync(participant_dir + "audio")

    /*Make subject csv folder*/
    if (!fs.existsSync(participant_dir + "csv")) fs.mkdirSync(participant_dir + "csv")

    return participant_dir
}
const make_set = function (participant_id='absdTest',repeat_set=5,total_chromatic=0,total_decoy=16,melody_length=12,melody_range = [0,12],repetition_gap = 2,questions_per_block=20) {

    const participant_dir = make_directories(participant_id)

    let json = load_json()
    let pitch_sets=json.map((set)=>{
        let transpositions = []
        while(transpositions.length<repeat_set) {
            let trans = getRandomInt(-3,3)
            if(transpositions.indexOf(trans)==-1) transpositions.push(trans)
        }
        let sets = []
        for(let transposition of transpositions) {
            let pitches = set.set
            let transposed_pitches = pitches.map((pitch)=>(pitch+12+transposition)%12)
            sets.push({id:set.id,pitches:pitches,transposition:transposition,transposed_pitches:transposed_pitches})
        }

        return sets
    }).flat() //a list with all the experimental sets appearing "repeat_set" times, each with a unique transposition
    pitch_sets=shuffle(pitch_sets) //shuffling the sets

    //make diatonic stimuli
    let diatonic_stimuli = []
    while (pitch_sets.length!=0) {
        let transposed_set = pitch_sets[pitch_sets.length-1].transposed_pitches
        let melody = edo.get.random_melody(melody_length,melody_range,repetition_gap,transposed_set,avoid_leaps_over=5)
        let melody_distribution = edo.get.pitch_distribution(melody,true)

        let middle_index1 = Math.ceil(melody.length/2)-1
        let middle_index2 = Math.ceil(melody.length/2)

        let swapped = [...melody]
        var temp = swapped[middle_index2]
        swapped[middle_index2] = swapped[middle_index1];
        swapped[middle_index1] = temp;
        let swapped_distribution = melody_distribution

        let shifted = [...melody]
        if(transposed_set.indexOf((shifted[middle_index1]+1)%12)==-1) {
            shifted[middle_index1]=shifted[middle_index1]+1
        }
        else if(transposed_set.indexOf((shifted[middle_index1]+12-1)%12)==-1) {
            shifted[middle_index1]=shifted[middle_index1]-1
        }
        else if(transposed_set.indexOf((shifted[middle_index2]+1)%12)==-1) {
            shifted[middle_index2]=shifted[middle_index2]+1
        }
        else if(transposed_set.indexOf((shifted[middle_index2]+12-1)%12)==-1) {
            shifted[middle_index2]=shifted[middle_index2]-1
        } else {
            continue
        }

        let shifted_distribution = edo.get.pitch_distribution(shifted,true)

        let melody_steps = edo.convert.to_steps(melody)
        if(melody_steps.indexOf(0)!=-1) continue //if same note repeats immediately

        let swapped_steps = edo.convert.to_steps(swapped)
        if(swapped_steps.indexOf(0)!=-1) continue //if same note repeats immediately

        let shifted_steps = edo.convert.to_steps(shifted)
        if(shifted_steps.indexOf(0)!=-1) continue //if same note repeats immediately


        let entry = pitch_sets.pop()
        entry.melody = melody
        entry.melody_dist = melody_distribution
        entry.swapped = swapped
        entry.swapped_dist = swapped_distribution
        entry.shifted = shifted
        entry.shifted_dist = shifted_distribution
        entry.type = "diatonic"
        entry.has_decoy = false
        diatonic_stimuli.push(entry)
    }
    let S_SH = Array.from(new Array(Math.floor(diatonic_stimuli.length/2)).fill(['swapped','shifted']))
    let SH_S = Array.from(new Array(diatonic_stimuli.length-S_SH.length).fill(['shifted','swapped']))
    let order = shuffle([...S_SH,...SH_S])
    diatonic_stimuli.forEach((stim)=>{stim.order = order.pop()})


    //make chromatic stimuli
    let chromatic_stimuli = []
    while (chromatic_stimuli.length<=total_chromatic) {
        let melody = edo.get.random_melody(melody_length,melody_range,repetition_gap,undefined,avoid_leaps_over=5)
        let melody_distribution = edo.get.pitch_distribution(melody,true)

        let middle_index1 = Math.ceil(melody.length/2)-1
        let middle_index2 = Math.ceil(melody.length/2)

        let swapped = [...melody]
        var temp = swapped[middle_index2]
        swapped[middle_index2] = swapped[middle_index1];
        swapped[middle_index1] = temp;
        let swapped_distribution = melody_distribution

        let shifted = [...melody]
        shifted[middle_index1]=shifted[middle_index1]+1
        let shifted_distribution = edo.get.pitch_distribution(shifted,true)

        let melody_steps = edo.convert.to_steps(melody)
        if(melody_steps.indexOf(0)!=-1) continue //if same note repeats immediately

        let swapped_steps = edo.convert.to_steps(swapped)
        if(swapped_steps.indexOf(0)!=-1) continue //if same note repeats immediately

        let shifted_steps = edo.convert.to_steps(shifted)
        if(shifted_steps.indexOf(0)!=-1) continue //if same note repeats immediately


        let entry = {}
        entry.melody = melody
        entry.melody_dist = melody_distribution
        entry.swapped = swapped
        entry.swapped_dist = swapped_distribution
        entry.shifted = shifted
        entry.shifted_dist = shifted_distribution
        entry.type = "chromatic"
        entry.has_decoy = false
        chromatic_stimuli.push(entry)
    }
    S_SH = Array.from(new Array(Math.floor(chromatic_stimuli.length/2)).fill(['swapped','shifted']))
    SH_S = Array.from(new Array(chromatic_stimuli.length-S_SH.length).fill(['shifted','swapped']))
    order = shuffle([...S_SH,...SH_S])
    chromatic_stimuli.forEach((stim)=>{stim.order = order.pop()})


    let decoy_pitch_sets=json.map((set)=>{
        let transpositions = []
        while(transpositions.length<repeat_set) {
            let trans = getRandomInt(-3,3)
            if(transpositions.indexOf(trans)==-1) transpositions.push(trans)
        }
        let sets = []
        for(let transposition of transpositions) {
            let pitches = set.set
            let transposed_pitches = pitches.map((pitch)=>(pitch+12+transposition)%12)
            sets.push({id:set.id,pitches:pitches,transposition:transposition,transposed_pitches:transposed_pitches})
        }

        return sets
    }).flat() //a list with all the experimental sets appearing "repeat_set" times, each with a unique transposition
    decoy_pitch_sets=shuffle(decoy_pitch_sets) //shuffling the sets
    decoy_pitch_sets = decoy_pitch_sets.slice(0,total_decoy)

    //make decoys
    let decoy_stimuli = []
    while (decoy_pitch_sets.length!=0) {
        let transposed_set = decoy_pitch_sets[decoy_pitch_sets.length-1].transposed_pitches
        let melody = edo.get.random_melody(melody_length,melody_range,repetition_gap,transposed_set,avoid_leaps_over=5)
        let melody_distribution = edo.get.pitch_distribution(melody,true)

        let middle_index1 = Math.ceil(melody.length/2)-1
        let middle_index2 = Math.ceil(melody.length/2)

        let swapped = [...melody]
        var temp = swapped[middle_index2]
        swapped[middle_index2] = swapped[middle_index1];
        swapped[middle_index1] = temp;
        let swapped_distribution = melody_distribution


        let shifted = [...melody]
        if(transposed_set.indexOf((shifted[middle_index1]+1)%12)==-1) {
            shifted[middle_index1]=shifted[middle_index1]+1
        }
        else if(transposed_set.indexOf((shifted[middle_index1]+12-1)%12)==-1) {
            shifted[middle_index1]=shifted[middle_index1]-1
        }
        else if(transposed_set.indexOf((shifted[middle_index2]+1)%12)==-1) {
            shifted[middle_index2]=shifted[middle_index2]+1
        }
        else if(transposed_set.indexOf((shifted[middle_index2]+12-1)%12)==-1) {
            shifted[middle_index2]=shifted[middle_index2]-1
        } else {
            continue
        }
        let shifted_distribution = edo.get.pitch_distribution(shifted,true)

        let melody_steps = edo.convert.to_steps(melody)
        if(melody_steps.indexOf(0)!=-1) continue //if same note repeats immediately

        let swapped_steps = edo.convert.to_steps(swapped)
        if(swapped_steps.indexOf(0)!=-1) continue //if same note repeats immediately

        let shifted_steps = edo.convert.to_steps(shifted)
        if(shifted_steps.indexOf(0)!=-1) continue //if same note repeats immediately


        let entry = decoy_pitch_sets.pop()
        entry.melody = melody
        entry.melody_dist = melody_distribution
        entry.swapped = swapped
        entry.swapped_dist = swapped_distribution
        entry.shifted = shifted
        entry.shifted_dist = shifted_distribution
        entry.type = "diatonic"
        entry.has_decoy = true
        decoy_stimuli.push(entry)
    }
    S_SH = Array.from(new Array(Math.floor(decoy_stimuli.length/2)).fill(['swapped','shifted']))
    SH_S = Array.from(new Array(decoy_stimuli.length-S_SH.length).fill(['shifted','swapped']))
    order = shuffle([...S_SH,...SH_S])
    decoy_stimuli.forEach((stim)=>{stim.order = order.pop()})

    let decoy_pos1 = Array.from(new Array(Math.floor(decoy_stimuli.length/2)).fill('swapped'))
    let decoy_pos2 = Array.from(new Array(decoy_stimuli.length-decoy_pos1.length).fill('shifted'))
    let decoy_position = shuffle([...decoy_pos1,...decoy_pos2])
    decoy_stimuli.forEach((stim)=>{
        let decoy_pos = decoy_position.pop()
        if(decoy_pos=='shifted') {
            stim.shifted = stim.melody
            stim.shifted_dist = stim.melody_dist
        }
        else if(decoy_pos=='swapped') {
            stim.swapped = stim.melody
            stim.swapped_dist = stim.melody_dist
        }
        stim.decoy_position = decoy_pos
    })
    decoy_stimuli = shuffle(decoy_stimuli)


    let all_stimuli_no_decoys = [...diatonic_stimuli,...chromatic_stimuli]
    let num_of_Qs = all_stimuli_no_decoys.length+total_decoy
    let num_of_blocks = Math.ceil(num_of_Qs/questions_per_block)
    let decoys_per_block = Math.ceil(total_decoy/num_of_blocks)
    all_stimuli_no_decoys = shuffle(all_stimuli_no_decoys)
    let blocks = []
    while(all_stimuli_no_decoys.length>0) {
        let real_qs = all_stimuli_no_decoys.splice(0,questions_per_block-decoys_per_block)
        let decoys = decoy_stimuli.splice(0,decoys_per_block)
        let all_block_stimuli = [...real_qs,...decoys]
        all_block_stimuli = shuffle(all_block_stimuli)
        blocks.push(all_block_stimuli)
    }
    blocks = shuffle(blocks)

    blocks.forEach((block,i)=> {
        make_block(participant_id,participant_dir,i+1,block)
    })





}



make_set()