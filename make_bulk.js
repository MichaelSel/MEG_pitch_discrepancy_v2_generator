// const fs = require('fs');
// const gen_task_set = require('./make_set')
//
// const make_txt = function (starting_id,num_of_sets,prefix="MEGp",root='./task_sets') {
//     let subs = []
//     for (let sub_id = starting_id; sub_id<starting_id+num_of_sets ; sub_id++) {
//         subs.push(prefix + "0".repeat(4-String(sub_id).length) + String(sub_id))
//     }
//     subs = subs.join('\n')
//     fs.writeFile(root + "/MEGp_available.txt", subs, function(err) {
//         if(err) {
//             return console.log(err);
//         }
//     });
//
// }
//
// const make_bulk = function (starting_id,num_of_sets,prefix="S1C",root='./task_sets') {
//     if (!fs.existsSync(root)) fs.mkdirSync(root)
//
//     let generated_sets = []
//
//     async function process_users (user_id) {
//         if(user_id<starting_id+num_of_sets) {
//             try {
//                 let sub_name = await gen_task_set(user_id,prefix,6,10,16,root)
//                 generated_sets.push(sub_name)
//             } catch (err) {
//                 console.error(err)
//             }
//             await process_users(user_id+1)
//         }
//     }
//     process_users(starting_id)
//         .then(function () {
//             generated_sets = generated_sets.join('\n')
//             fs.writeFile(root + "/StudyI16.txt", generated_sets, function(err) {
//                 if(err) {
//                     return console.log(err);
//                 }
//             });
//         })
// }
//
//
// const make_list = function (list_of_sets,prefix="MEGp",root='./task_sets_new') {
//     if (!fs.existsSync(root)){
//         fs.mkdirSync(root);
//     }
//     let generated_sets = []
//
//     async function process_users (user_id) {
//         try {
//             let sub_name = await gen_task_set(user_id,prefix,root)
//             generated_sets.push(sub_name)
//         } catch (err) {
//             console.error(err)
//         }
//         if (list_of_sets.length>0) await process_users(list_of_sets.shift())
//     }
//     process_users(list_of_sets.shift())
//         .then(function () {
//             generated_sets = generated_sets.join('\n')
//             fs.writeFile(root + "/MEGp_available.txt", generated_sets, function(err) {
//                 if(err) {
//                     return console.log(err);
//                 }
//             });
//         })
// }
// // make_txt(50,50)
//
//
//
//
// make_bulk(1666,19)