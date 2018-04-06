const fs = require('fs-extra');
const rp = require('request-promise');
const a = require('async');

let entrezBase = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
let outfile = "algae.fa";
let concurrency = 50;
let requests = 2000;	// number of requests
let countSeq = 0;
let sizeLimit = 20000;	// limit sequence size

fs.writeFileSync(outfile,";\n");

let organisms = [
	{name:'Micromonas commoda', accession:'SAMN03081421'},					// 10077 seqs
	{name: 'Chlorella variabilis',accession:'SAMN02744065'},					// 415 seqs
	{name: 'Auxenochlorella protothecoides',accession:'SAMN02433493'}, 		// 655
	//{name: 'Picochlorum sp. SENEW3',accession:'SAMN02739349'},				// 1 seq
	{name: 'Ostreococcus tauri',accession:'SAMEA3138397'},					// 7703 seqs
	//{name: 'Coccomyxa sp. SUA001',accession:'SAMN03761152'},					// 1 seq
	//{name: 'Bathycoccus prasinos',accession:'PRJEA71363'},					// 0 seqs
	{name:'Bathycoccus sp. TOSAG39-1', accession:'SAMEA3727691'},				// 2119
	{name:'	Ostreococcus lucimarinus CCE9901', accession:'SAMN03081420'},	// 7645
	{name: 'Trebouxia gelatinosa',accession:'SAMN03104849'}						// 109
];

let url = entrezBase+'esearch.fcgi?db=nucleotide&term='+organisms[0].accession+'&retmax=20&retstart=0&retmode=json';


doAllOrganisms(organisms);

function doAllOrganisms(organisms) {
	
	a.eachSeries(organisms, function(organism,cb1) {
		getNuclRange(organism,0,requests,function(err) {
			if (err) {
				return cb1(err);
			}
			console.log("Completed: ",organism.name);
			cb1();
		});
	},
	function (err) {
		if (err) {
			console.log("error occurred",err);
			return;
		}
		console.log("all done!");
	});
	
}

function getNuclRange(organism,start,count,callback) {
	let options = {
		uri: entrezBase+'esearch.fcgi',
		qs: {
			db: 'nucleotide',
			term: organism.accession,
			retmax: count,
			retstart: start,
			retmode: 'json'
		},
		headers: {
			'User-Agent': 'Request-Promise'
		},
		json: true // Automatically parses the JSON string in the response
	};
	rp(options)
		.then(function (orgdata) {
			console.log('organism: '+organism.name+' '+organism.accession);
			console.log('sequences: '+orgdata.esearchresult.count);
			//console.log(orgdata.esearchresult.idlist);
			
			let ids = orgdata.esearchresult.idlist;
			
			a.eachLimit(ids,concurrency, function(id, cb) {

				fetchFASTA(id,function(err) {
					cb();
				});
				
			}, function(err) {
				if( err ) {
				  console.log('an id failed',err);
				  return callback(err);
				} 
				//let totSeqs = parseInt(orgdata.esearchresult.count,10);
				//let nextStart = start+count;
				//if (nextStart < totSeqs) {
				//	getNuclRange(accession,nextStart,count,callback);
				//	return;
				//}
				callback();
			});	
		})
		.catch(function (err) {
			callback(err);
			//console.log('failed',err);
		});
}	
	
function fetchFASTA(id,cb) {
	let options = {
		uri: entrezBase+'efetch.fcgi',
		qs: {
			db: 'nuccore',
			id: id,
			rettype: 'fasta',
			retmode: 'text'
		},
		headers: {
			'User-Agent': 'Request-Promise'
		}
	};
	rp(options)
		.then(function (data) {
			countSeq++;
			if (data.length < sizeLimit) {
				let comment = countSeq+' id: '+id+' '+data.length;
				console.log(comment);
				fs.appendFileSync(outfile,'; '+comment+'\n');
				fs.appendFileSync(outfile,data);
			}
			cb();
		})
		.catch(function (err) {
			cb({msg:'request id '+id+' failed',err:err});
		});
};
