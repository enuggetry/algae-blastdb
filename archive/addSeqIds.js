const fs = require('fs-extra');
const lineReader = require('readline').createInterface({
  input: fs.createReadStream('things.fa')
});
const outFile = 'things-out.fa';
fs.writeFileSync(outFile,"");

let count = 0;
let countSeq = 0;

lineReader.on('line', function (line) {
	//if (count++ > 100) process.exit(0);
	
	if (line[0]=='>') {
		line = addSeqId(line);
	}
	//console.log(count+': '+line);
	//if (line.length) 						// skip empty lines
		fs.appendFileSync(outFile,line+"\n");
});

function addSeqId(line) {
	let h = line.split(" ");
	let accession = h[0].substr(1);
	countSeq++;
	
	// https://ncbi.github.io/cxx-toolkit/pages/ch_demo#ch_demo.T5
	let seqid = ">gn1|algae|"+countSeq;  // general format
	//let seqid = ">emb|"+accession+"|";   // EMBL format
	
	h[0] = seqid;
	//h.unshift(seqid);
	return h.join(" ");
}