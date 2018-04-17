const Fasta = require('biojs-io-fasta');
const _ = require('lodash');
const fs = require('fs-extra');

let url = 'file:///var/www/html/blasttest/volvox.fa';
let inFile = 'volvox.fa';
let outFile = 'fauxdb.fa';
let count = 0;
let seq = "";
let mi = .05;	// mutations per iteration.
let lineLen = 70;

// create new file
fs.writeFileSync(outFile,"");

let fauxOrganisms = [
	"flaccidos caede bimembres certatimque",	// flaccid centaur
	"quisquiliae minotuar",						// trashy minotuar
	"draco hyacintho gelata",					// blue jelly dragon
	"puer aureus homine sene",					// orange-haired man-child
	"deturpant simia",							// grease monkey
	"kessinger avis malae texere",				// fanged dodo bird
	"tigris de niliacis",						// hooting tiger
	"cyclopis ebrius est"						// drunk cyclops
];


lineReader = require('readline').createInterface({
  input: require('fs').createReadStream(inFile)
});

lineReader.on('line', function (line) {
  //console.log(line);
  if (line[0] !== '>') {
	count++;
	seq += line;
  }
});
lineReader.on('close', function () {
	seq = seq.toLowerCase(seq);
	let origSeq = _.clone(seq);
	
	for (let i=0;i<8;i++) {
		seq = mutate(seq,mi);
		exportFauxSeq(seq,fauxOrganisms[i],outFile);
		console.log("% change " + verifyPercentChange(origSeq,seq));
	}
	seq = mutate(seq,mi);
	//console.log("mutated seq",seq);
	console.log("done "+seq.length+" characters");
	//console.log("% change " + verifyPercentChange(origSeq,seq));
});

function mutate(seq,pct) {
	let mCount = Math.floor(seq.length * pct);
	let mList = {}; 	// list of mutations (so we don't do the same one twice);
	let strlst = "";
	//console.log("mCount",mCount);
	let ltrs = "ATGC";
	
	for(let i=0;i<mCount;i++) {
		// random location
		let loc = Math.floor(Math.random() * seq.length);
		// random new letter
		let newLtr = ltrs[Math.floor(Math.random() * ltrs.length)];
		
		// avoid locations that were already replaced
		while (
			typeof mList[loc] !== 'undefined' 
			//|| (seq[loc] >= 'A' && seq[loc] <= 'Z')
			) {
				
			loc = Math.floor(Math.random() * seq.length);
		}
		// avoid replaceing with the same letter, or already done
		while (seq[loc].toUpperCase() === newLtr) {
			newLtr = ltrs[Math.floor(Math.random() * ltrs.length)];
		}
		mList[loc] = true;
		strlst += loc+" ";	// for debugging
		seq = replaceAt(seq,loc,newLtr);
	}
	return seq;
}

function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}

function verifyPercentChange(seq1,seq2) {
	let count = 0;
	for(let i=0;i<seq1.length;i++) {
		if (seq2[i] >= 'A' && seq2[i] <= 'Z')
			count++;
	}
	return precisionRound(count / seq1.length,2);
}

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

function exportFauxSeq(seq,header,file) {
	let count = Math.floor(seq.length / lineLen);
	fs.appendFileSync(file,"\n>"+header+"\n");
	for(let i=0;i<count+1;i++) {
		//console.log(seq.substr(i*lineLen,lineLen));
		fs.appendFileSync(file,seq.substr(i*lineLen,lineLen)+"\n");
	}
}