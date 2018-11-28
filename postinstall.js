const path = require('path');
//const approot = path.dirname(require.main.filename);
const approot = require('app-root-path');
const sh = require('shelljs');
const fs = require('fs-extra');

let target = approot+'/blastdb';
let src = 'fauxdb.tar.gz';

fs.ensureDirSync(target);

sh.exec('cp '+src+' '+target);

process.chdir(target);


console.log("copying algae blastdb...");
sh.exec('tar -zxvf fauxdb.tar.gz');

console.log("cleaning up...");
sh.exec('rm '+target+'/fauxdb.tar.gz');
