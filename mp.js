#!/home2/defeng.liu/mybin/node

/* defeng.liu - 2018-03-08
purpose:
  1. move patch to project local folder and rename it
*/

const version = "1.0.1";

const {execSync} = require("child_process");
const fs = require("fs");
const path = require("path");

const cwd = process.cwd();
const l = console.log;
const q = () => {process.exit(1)}

function color(start, end) {
	return  function() {
		let str = `\x1B[${start}m`;
		str += this;
		str += `\x1B[${end}m`;
		return str;
	}
}

function initColors() {
	let styles = {
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],
		gray: [90, 39],
		grey: [90, 39]
	}
	for([key, [start, end]] of Object.entries(styles)) {
		String.prototype[key] = color(start, end);
	}
}

function help() {
	l(`mp - move or copy patch to project patches folder and rename it

usages:	mp [options] file [...file] folder

	mp  -v  [--version]\tprint version

	mp  -h  [--help]\tprint help message

	mp  -c  [--copy]\tcopy patch but not move
	
Example:

	mp 0001-test.patch 0002-test.patch R9000/package/net-cgi/patches
	`)
}

function isDir(path) {
	try {
		let stat = fs.statSync(path);
		return Number(stat.isDirectory());
	}
	catch(err) {
		return -1;
	}
}

function accessable(path) {
	try {
		fs.accessSync(path);
		return true;
	}
	catch(err) {
		return false;
	}
}

function printErr(msg) {
	l(`${">>>".red()} ${msg}`);
}

(async function() {
	initColors();
	let argv = process.argv.slice(2);
	let files = [];
	let isCopy = false;
	let target;
	let checkFail = false;
	
	argv.forEach(v => {
		if(/^(-[a-z]|--[a-z]+)$/i.test(v)) {
			if(/^(-[vhc]|--(version|help|copy))$/.test(v) === false) {
				help();
				q();
			}
		}
	})

	argv.forEach((v, k) => {
		if(v === '-v' || v === '--version') {
			console.log(`${version}`);
			q();
		}
		if(v === '-h' || v === '--help') {
			help();
			q();
		}
		if(v === '-c' || v === '--copy') {
			isCopy = true;
			return true;
		}

		if(k === argv.length - 1) {
			target = path.resolve(cwd, v);
			let r = isDir(target);
			if(r === -1) {
				printErr(`${v.yellow()} is not exist or is not accessable`);
				q();
			}
			else if(r === 0) {
				printErr('the last argument should be a folder');
				q();
			}
			return true;
		}

		let file = path.resolve(cwd, v);
		let r = accessable(file);
		if(r === false) {
			printErr(`${v.yellow()} is not exist or is not accessable`);
			checkFail = true;
		}
		else if(/^\d{4}-.*?\.patch$/.test(path.basename(file)) === false) {
			printErr(`${v.yellow()} is not a patch`);
			checkFail = true;
		}
		files.push(file);
	})
	if(argv.length < 2 || (argv.length < 3 && isCopy) || checkFail) {
		if(checkFail === false) {
			help();
		}
		q();
	}

	let maxIndex = 0;
	try {
		let patches = fs.readdirSync(target);
		patches.forEach(v => {
			if(/^\d{4}-.*?\.patch$/.test(v)) {
				let index = v.replace(/^(\d{4})-.*?\.patch$/, "$1");
				if(parseInt(index) > maxIndex) {
					maxIndex = index;
				}
			}
		})
	}
	catch(err) {
		l(err);
		q();
	}

	files.forEach(v => {
		let index = (++maxIndex).toString().padStart(4, "0");
		let name = path.basename(v).replace(/^(\d{4})(-.*?\.patch)$/, index + "$2");
		let store = path.resolve(target, name);
		try {
			execSync(`${isCopy? "cp": "mv"} ${v} ${store}`);
			l(`${">>>".green()} ${path.basename(v).cyan()} ---> ${store.green()}`);
		}
		catch(err) {
			printErr(`${v.yellow()} task fail`);
			maxIndex --;
		}
	})
})()
