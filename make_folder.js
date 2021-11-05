const fs = require('fs');


const make_folder = function (root='./task_sets',folder_names) {
    if(!Array.isArray(folder_names)) folder_names = [folder_names]
    folder_names.forEach(f=>{
        if (!fs.existsSync(root + f)){
            fs.mkdirSync(root + f);
        }
    })
}

module.exports = make_folder