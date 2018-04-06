const sh = require('shelljs');
const fs = require('fs-extra');

let newdir = 'algae';
let blastbin = './blastbin/ncbi-blast-2.7.1+/bin/';

sh.exec('rm -rf '+newdir);

fs.ensureDirSync(newdir);

if (!fs.existsSync(blastbin)) process.exit(1);

sh.exec(blastbin+'makeblastdb -in algae.fa -out algae -parse_seqids -dbtype nucl');

sh.exec('mv algae.n* algae');

sh.exec('tar -zcvf algae.tar.gz algae');


