const sh = require('shelljs');
const fs = require('fs-extra');

let newdir = 'faux';
let blastbin = './blastbin/ncbi-blast-2.7.1+/bin/';

sh.exec('rm -rf '+newdir);

fs.ensureDirSync(newdir);

if (!fs.existsSync(blastbin)) process.exit(1);

sh.exec(blastbin+'makeblastdb -in fauxdb.fa -out faux/faux -dbtype nucl');

//sh.exec('mv algae.n* faux');

sh.exec('tar -zcvf fauxdb.tar.gz faux');


