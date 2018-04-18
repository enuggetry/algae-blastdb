const fs = require('fs-extra');
let count = 0;

fs.writeFileSync('volvoxConcat.fa',"");

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('jbvolvox.fa')
});

lineReader.on('line', function (line) {
  console.log('Line from file:', line);
  if (line[0] !== '>') {
	count++;
	str = ">volvox"+count+"\n";
	str += line+"\n";
    fs.writeFileSync('volvoxclips/volvox'+count+'.fa',str);
	
	fs.appendFileSync('volvoxConcat.fa',str);
  }
});