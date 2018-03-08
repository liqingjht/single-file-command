#!/bin/bash

# @ defeng.liu 2018-03-08

help() {
	printf "Usage: uplang [language-table.git] project/langugae-folder...\n\n"
	printf "	result-folder defautl is: $HOME/git_home/net-web-language-table.git\n\n"
	printf "Example:\n\n"
	printf "	uplang ~/project/r9000-buildroot/package/net-cgi/www\n\n"
	printf "	uplang ~/git_home/net-web-language-table.git/ ~/project/r9000-buildroot/package/net-cgi/www\n\n"
}

err() {
	if [ $# -gt 0 ]; then
		echo $@
	fi
	exit 1;
}

if [ $# -eq 1 ]; then
	result="$HOME/git_home/net-web-language-table.git/result/lang_js"
	target=$1
elif [ $# -eq 2 ]; then
	result="$1/result/lang_js"
	target=$2
else
	help
	exit 1
fi

#lastC=`echo ${result: -1}` #need space
#
#if [ ! $lastC = "/" ]; then
#	result="$result/"
#fi
#
#lastC=`echo ${target: -1}`
#
#if [ ! $lastC = "/" ]; then
#	target="$target/"
#fi

if [ ! -d $target ]; then
	help
	exit 1
fi

if [ ! -d $result ] && [ $# -eq 2 ]; then
	help
	exit 1
fi

count=`ls $target 2>/dev/null |grep -E -i -c "^languages-[a-z]{2,3}\.js$"`

if [ $count -eq 0 ]; then
	err "can't find any languages-xx.js file"
fi

count=`ls $result 2>/dev/null |grep -E -i -c "^[a-z]{2,3}\.js$"`

if [ $count -eq 0 ]; then
	err "can't find any xxx.js file"
fi

files=`ls $target |grep -E -i "^languages-[a-z]{2,3}\.js$"`

isFail=0

for file in $files;
do
	shortcut=`echo $file | cut -d "-" -f 2`
	if [ $shortcut = "en.js" ]; then
		shortcut="Eng.js"
	else
		shortcut=`echo $shortcut |cut -d "." -f 1 |tr a-z A-Z`
		shortcut="${shortcut}.js"
	fi
	if [ ! -e ${result}/${shortcut} ]; then
		err "can not find $shortcut in $result"
	else
		cp ${result}/${shortcut} ${target}/${file} 2>/dev/null
		echo ""
		if [ $? = 0 ]; then
			echo ">>> updated ${target}/${file}"
		else
			echo "!!! fail ${target}/${file}"
			isFail=1
		fi
	fi
done

if [ $isFail -ne 1 ]; then
	tarFile=`ls $result/.. |grep .tar.gz`
	vers=`echo $tarFile |grep -E -i -o "v([0-9]+\.){3}[0-9]+"`
	echo -e "\nVersion: $vers"
fi
