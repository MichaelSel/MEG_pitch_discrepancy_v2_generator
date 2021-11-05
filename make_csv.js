const fs = require('fs');
const csv = require('csv-parser');

const make_csv = function (participant_id,participant_dir,block_num,stimuli) {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: participant_dir + "csv/" + "block_" + block_num + ".csv",
        header: [
            {id: 'subject_id', title: 'subject_id'}, //OVS...
            {id: 'block_num', title: 'block_num'}, //1-...
            {id: 'num_in_task', title: 'num_in_task'}, //1-...
            {id: 'num_in_block', title: 'num_in_block'}, //1-...
            {id: 'probe', title: 'probe'}, //1-...
            {id: 'shifted', title: 'shifted'}, //1-...
            {id: 'shift_dir', title: 'shift_dir'}, //1-...
            {id: 'shift_amount', title: 'shift_amount'}, //1-...
            {id: 'shift_position', title: 'shift_position'}, //1-...
            {id: 'set', title: 'set'}, //1-...
            {id: 'mode', title: 'mode'}, //1-...
            {id: 'mode_num', title: 'mode_num'}, //1-...
            {id: 'transposition', title: 'transposition'}, //1-...
            {id: 'probe_file', title: 'probe_file'}, //1-...
            {id: 'test_file', title: 'test_file'}, //1-...

        ]
    });





    fs.writeFile(participant_dir + "csv/" + "block_" + block_num + ".json", JSON.stringify(stimuli), function(err) {
        if(err) {
            return console.log(err);
        }
    });

    let data =stimuli.map((stim,i) => {
        let dat = {
            subject_id: stim.subject_id,
            block_num: stim.block,
            num_in_task: stim.num_in_task,
            num_in_block:stim.num_in_block,
            probe: stim.probe,
            shifted: stim.shifted,
            shift_dir: stim.shift_dir,
            shift_amount: stim.shift_amount,
            shift_position: stim.shift_position,
            set: stim.set,
            mode: stim.mode,
            mode_num: stim.mode_num,
            transposition: stim.transposition,
            probe_file:stim.probe_file,
            test_file:stim.test_file
        }

        return dat
    })


    csvWriter
        .writeRecords(data)
        .then(()=> console.log("CSV file subject",participant_id,"block", block_num,"was successfully created."));
}

module.exports = make_csv