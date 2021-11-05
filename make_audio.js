const fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');

// let audio_dir = "C:\\Users\\Michael\\Documents\\Academia\\Studies\\Set vs Order Preference\\audio\\"
let audio_dir = "E:\\Documents\\Academia\\Studies\\Set vs Order Preference\\audio\\"
const make_audio = function (stimuli,path) {
    return new Promise(function (resolve, reject) {
        // merge file
        let adage = 13
        let file = stimuli[0] + adage + ".wav"
        let audio = ffmpeg(audio_dir+ file)
        for(let i=1;i<stimuli.length;i++) {
            file = stimuli[i]+adage + ".wav"
            audio.input(audio_dir+file)
        }
        audio.mergeToFile(path).on('progress', function(progress) {
            // console.log('Processing: ' + progress.percent + '% done');
        }).on('end', function () {
            resolve("Audio generated")
        }).on('error',function(e) {
            reject(e)
        });
    })
}

module.exports = make_audio