const make_stimuli = require('./make_stimuli')
const make_folder = require('./make_folder')
const make_block_csv = require('./make_csv')
const make_audio = require('./make_audio')

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**Set Settings here*/
async function gen_task_set (sub_id,prefix,root) {
    const sub_name = prefix + "0".repeat(4-String(sub_id).length) + String(sub_id)

    make_folder(root,"/" + sub_name)
    make_folder(root + "/" + sub_name,["/audio","/csv"])

    const blocks = await make_stimuli(sub_name,15)

    const process_block_audio = function (block) {
        const audio_dir = root+"/" + sub_name +"/audio/"
        let mp3 = []
        block.forEach((stimulus,Q_num)=>{
            mp3.push(make_audio(stimulus["probe"],audio_dir + stimulus.probe_file),make_audio(stimulus["shifted"],audio_dir + stimulus.test_file),)
        })
        return Promise.all(mp3)

    }
    async function process_block  (block_num=0) {
        if(block_num<blocks.length) {
            console.log(sub_name,"processing block " +  (block_num+1))
            let block = blocks[block_num]
            block.forEach((stimulus,Q_num)=>{
                stimulus.block = block_num+1
            })
            make_block_csv(sub_name,root+"/" + sub_name +"/",block_num+1,block)
            await process_block_audio(block)
            console.log("created block " + parseInt(block_num+1) +" audio")
            await process_block(block_num+1)
        }
    }
    await process_block(0).then(function () {
        console.log("finished", sub_name)
    })
    return sub_name
}


module.exports = gen_task_set



gen_task_set(0,'MEGv2_','./task_sets')
