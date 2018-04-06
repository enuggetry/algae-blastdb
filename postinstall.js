const approot = require('app-root-path');
const sh = require('shelljs');
const fs = require('fs-extra');

let target = approot+'/blastdb';
let src = 'algae.tar.gz';

fs.ensureDirSync(target);

sh.exec('cp '+src+' '+target);

process.chdir(target);


console.log("copying algae blastdb...");
sh.exec('tar -zxvf algae.tar.gz');

console.log("cleaning up...");
sh.exec('rm '+target+'/algae.tar.gz');
