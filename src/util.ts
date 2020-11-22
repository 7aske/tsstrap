export const camelToKebab = (text: string) => {
	if (text === null || text === undefined) {
		return text;
	}
	let result = "";
	let upper = 0;
	let numeric = undefined;
	let string = String(text);
	for (let i = 0; i < string.length; i++) {
		let ch = string[i];
		let chLower = ch.toLowerCase();
		if (ch !== chLower) {
			let prev = result[result.length - 1];
			if (upper > 1 && result.length > 1) {
				result = result.slice(0, result.length - 2) + prev;
			}
			if (result.length && prev !== "-" &&
				prev !== " " && prev !== "\t" && prev !== "\r" && prev !== "\n"
			) {
				result += "-";
			}
			result += chLower;
			upper++;
			numeric = false;
		} else if (
			ch === "0" || ch === "1" || ch === "2" || ch === "3" ||
			ch === "4" || ch === "5" || ch === "6" || ch === "7" ||
			ch === "8" || ch === "9"
		) {
			if (numeric === false && result[result.length - 1] !== "-") {
				result += "-";
			}
			result += ch;
			upper = 0;
			numeric = true;
		} else if (numeric && result[result.length - 1] !== "-") {
			result += "-" + ch;
			upper = 0;
			numeric = false;
		} else {
			result += ch;
			upper = 0;
			numeric = false;
		}
	}
	if (upper > 1 && result.length > 1) {
		result = result.slice(0, result.length - 2) + result[result.length - 1];
	}
	return result;
};

export const plural = (str: string): string => {
	if (str.endsWith("s")) str = str + "es";
	else if (str.endsWith("y")) str = str.substring(0, str.length - 1) + "ies";
	else str = str + "s";
	return str;
};
