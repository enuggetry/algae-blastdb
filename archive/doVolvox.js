const sh = require('shelljs');
const fs = require('fs-extra');


let files = fs.readdirSync('volvoxclips');
for(var i in files) {
	let file = 'volvox'+i+'.fa';
	console.log('file',file);
	sh.exec("./blastbin/ncbi-blast-2.7.1+/bin/blastn -db blastdb/algae/algae -outfmt 6 -query volvoxclips/"+file);
}