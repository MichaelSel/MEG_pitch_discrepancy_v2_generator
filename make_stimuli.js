const EDO = require("./edo.js").EDO
let edo = new EDO(12)
const mod = (n, m) => {
    return ((n % m) + m) % m;
}
const JS = function (thing) {
    return JSON.stringify(thing).replace(/"/g,'')
}
const all_diatonic_modes = edo.scale([0,2,4,5,7,9,11]).get.modes()

const CJS = function (thing) {
    console.log(JS(thing))
}
const rand_int_in_range = function (min,max) {
    return Math.floor(Math.random() * (max - min +1)) + min
}

const rand_int_in_range_but_not_zero = function (min,max) {
    let val = Math.floor(Math.random() * (max - min +1)) + min
    while(val==0) val = Math.floor(Math.random() * (max - min +1)) + min
    return val
}
const unique_in_array = (list) => {

    let unique  = new Set(list.map(JSON.stringify));
    unique = Array.from(unique).map(JSON.parse);

    return unique
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const make_melody = (pitches,wrong_note_pos,melody_length) =>{
    shift_dir = rand_int_in_range_but_not_zero(-1,1)
    let melody = edo.get.random_melody(melody_length,[0,12],4,pitches,5)
    melody[wrong_note_pos]+=shift_dir
    const melody_pitches = Array.from(new Set(melody.map(p=>p%12))).sort((a,b)=>a-b)
    if(melody_pitches.length==pitches.length) return make_melody(pitches,wrong_note_pos,melody_length)
    return {melody:melody,shift_dir:shift_dir}
}

const make_block = async function (subject_id,sets=[[0,2,4,7,9],[0,1,2,3,5]],melody_length=12) {
    let all_stim = []
    await Promise.all(
        sets.map(async set => {
            let stim = await make_stimuli(subject_id, 15, 0, [0, 12], melody_length, set)
            all_stim.push(...stim)
        })
    );

    all_stim = shuffle(all_stim)




    all_stim = all_stim.map((q,i)=>{
        q.num_in_block = i+1
        return q
    })

    return all_stim

}

const make_stimuli = async function (subject_id,realQs=10, decoys=0,range=[0,12],length=12,set=[0,2,4,7,9]) {

    let time = Date.now()



    /**
     * Pseudo-randomizing
     * --------------------
     */

        //Shift up or down?
    let set_shift_array = shuffle(Array.from(Array(realQs+decoys)).map((el,i)=>(i<(realQs+decoys)/2)?-1:1))

    // //Shift position (2nd to last or 3rd to last)
    let set_note_to_shift = shuffle(Array.from(Array(realQs+decoys)).map((el,i)=>(i<(realQs+decoys)/2)?Math.floor(length/2)-1:Math.floor(length/2)))



    //Transposition array
    let random_start = rand_int_in_range(0,6)
    let transpositions = shuffle(Array.from(Array(realQs+decoys)).map((el,i)=>((i+random_start)%7)-3))

    //Mode array
    random_start = rand_int_in_range(0,set.length)
    let modes = shuffle(Array.from(Array(realQs+decoys)).map((el,i)=>(i+random_start)%set.length))

    let Q = []
    while(Q.length<(realQs+decoys)) {

        let mode_num = modes[0]
        let Q_mode = edo.scale(set).mode(mode_num).pitches
        let pitches = edo.get.random_melody(length,range,true,Q_mode,avoid_leaps=6,end_with_first=false)

        //Verify that the melody includes all pitches BEFORE the shift position
        let unique_pitches = Array.from(new Set(pitches.slice(0,pitches.length-3).map(p=>edo.mod(p,12))))
        if (unique_pitches.length<set.length) continue;




        let probe = [...pitches]
        let shifted = [...probe] //similar to probe if decoy. Get's altered if not decoy
        let shift_dir = 0
        let shift_amount = 0
        let shift_pos = 0
        let decoy = true
        if(Q.length< realQs) {

            let note_to_shift = set_note_to_shift[0]
            let amount_to_shift = set_shift_array[0]
            let shift_direction = (amount_to_shift==-1) ? "down" : "up"


            shifted[note_to_shift] = shifted[note_to_shift] + amount_to_shift


            let unique_in_shifted = Array.from(new Set(shifted.map(p=>edo.mod(p,12))))

            //if shifted note doesn't violate set: discard
            if(unique_in_shifted.length<=set.length) continue

            //if shifted notes fit into a diatonic set: discard
            let temp_scale = edo.scale(unique_in_shifted)
            let subset = false
            for (let mode of all_diatonic_modes) {
                if(edo.is.subset(unique_in_shifted,mode)) subset=true
            }
            if(subset) continue



            shift_dir = shift_direction


            decoy = false

            //Discard if pitches create diatonic set
            unique_pitches = Array.from(new Set(shifted.map(p=>edo.mod(p,12))))
            let is_subset = edo.scale(unique_pitches).is.subset(all_diatonic_modes)
            if(is_subset) continue
        }


        //Make sure there are no repeated notes in any of the test conditions
        if(edo.convert.to_steps(probe).indexOf(0)!=-1) continue

        if(edo.convert.to_steps(shifted).indexOf(0)!=-1) continue


        shift_pos = set_note_to_shift.shift()
        shift_amount = set_shift_array.shift()

        //Transpose melody
        let transposition = transpositions.shift()
        probe = probe.map(p=>p+transposition)
        shifted = shifted.map(p=>p+transposition)
        modes.shift()

        Q.push({subject_id:subject_id,probe:probe, shifted:shifted,shift_dir:shift_dir, shift_amount:shift_amount,shift_position: shift_pos,set:set,mode:Q_mode,mode_num:mode_num,transposition:transposition, decoy:decoy})




    }
    let stimuli = shuffle(Q)
    return stimuli
}

const make_set = async function (subject_id,num_of_blocks=10) {

    let all_blocks = []

    for (let i = 0; i < num_of_blocks; i++) {
        let block = await make_block(subject_id)
        block = block.map((Q,num)=>{
            Q.block=i+1
            Q.num_in_task = (i*block.length)+Q.num_in_block
            Q.probe_file = "Block-" + Q.block + "-Q-" + Q.num_in_block + "-000-probe.wav"
            Q.test_file = "Block-" + Q.block + "-Q-" + Q.num_in_block + "-001-test.wav"

            return Q
        })
        all_blocks.push(block)
    }
    return all_blocks

}

module.exports = make_set
