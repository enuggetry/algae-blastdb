const _ = require('lodash');
const fs = require('fs-extra');
const fetch = require('node-fetch');
const async = require('async');
//var rand = require('random-seed').create("faux");

let url = 'file:///var/www/html/blasttest/volvox.fa';
let inFile = 'volvox.fa';
let outFile = 'fauxdb.fa';
let mi = .04;	// mutations per iteration.
let lineLen = 70;
let organismCount = 0;
let organismSeries = [10,12,15,20,25,30,40,50];

let animalsUrl = 'https://raw.githubusercontent.com/boennemann/animals/master/words.json';
let ajectivesUrl = 'https://raw.githubusercontent.com/dariusk/corpora/master/data/words/adjs.json';
let organismList = {};  // list of used organisms
let nameDb = null;

//fs.writeFileSync(outFile,"");   // create new fa file
let writeStream = fs.createWriteStream(outFile);

// read animals and ajectives
async.parallel({
    animals: function(cb) {
        fetch(animalsUrl)
            .then(res => res.json())
            .then(json => {
                cb(null, json);
            }
        );
    },
    adjectives: function(cb) {
        fetch(ajectivesUrl)
            .then(res => res.json())
            .then(json => {
                cb(null, json.adjs);
            }
        );
    }
}, function(err, results) {
    // done reading animals and ajectives
    if (err) return;
    //console.log('results',results);
    nameDb = results;

    generate();
    
});

function generateOrganismName() {
    while(true) {
        let animal = nameDb.animals[Math.floor(Math.random() * nameDb.animals.length)];
        let adjective = nameDb.adjectives[Math.floor(Math.random() * nameDb.adjectives.length)];
        let newName = adjective+' '+animal;
        
        // ensure no two organism names are the same.
        if (typeof organismList[newName] === 'undefined') {
            organismList[newName] = true;
            return newName;
        }   
    }
}

function generate() {
    // assuming openFiles is an array of file names
    async.eachSeries(organismSeries, function(n, cb) {
        generateMutants(n,function() {
            cb();
        });
    }, function(err) {
        if( err ) {
          console.log('An error occurred');
        } else {
          console.log('done - organismCount',organismCount);
        }
    });    
}

// generate n muntants, each mutant is 5% different than the previous
function generateMutants(n,done) {
    let seq = "";
    lineReader = require('readline').createInterface({
      input: fs.createReadStream(inFile)
    });

    lineReader.on('line', function (line) {
      //console.log(line);
      if (line[0] !== '>') {
            //count++;
            seq += line;
      }
    });
    lineReader.on('close', function () {
            seq = seq.toLowerCase(seq);
            let origSeq = _.clone(seq);

            for (let i=0;i<n;i++) {
                    seq = mutate(seq,mi);
                    let name = generateOrganismName();
                    exportFauxSeq(seq,name,outFile);
                    console.log("% change " + verifyPercentChange(origSeq,seq));
                    organismCount++;
            }
            seq = mutate(seq,mi);
            //console.log("mutated seq",seq);
            console.log("done "+seq.length+" characters");
            //console.log("% change " + verifyPercentChange(origSeq,seq));
            done();
    });
}

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
	//fs.appendFileSync(file,"\n>"+header+"\n");
        writeStream.write("\n>"+header+"\n")
	for(let i=0;i<count+1;i++) {
		//console.log(seq.substr(i*lineLen,lineLen));
		writeStream.write(seq.substr(i*lineLen,lineLen)+"\n");
	}
}