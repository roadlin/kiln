function classification (dataIn) {

	var dataMatrix = [[],[]];

	for (i in dataIn) {
		if( i.indexOf("温区") != -1 ) {
			if (i.indexOf("上") != -1) {
				dataMatrix[0].push(dataIn[i]);
			}
			else {
				dataMatrix[1].push(dataIn[i]);
			}
		}
	};
	return dataMatrix;

}

function categoriesZoneData (dataIn) {
	var voData = [[],[]];
	for (i in dataIn) {
		if( i.indexOf("电压") != -1) {
			var areaIndex = i.slice(0, i.indexOf("温区"));
			if (areaIndex % 2) {
				voData[0].push({ voltage: parseInt(dataIn[areaIndex+"温区_电压"]), current: parseInt(dataIn[areaIndex+"温区_电流"])})
			}
			else {
				voData[1].push({ voltage: parseInt(dataIn[areaIndex+"温区_电压"]), current: parseInt(dataIn[areaIndex+"温区_电流"])})
			}
		}
	};
	return voData;
}

function getRate (dataIn, addOrSub) {

	var param = window.paramObject;
	var addend;
	if (addOrSub == "add") {
		window.normalRate.totalNumber += 2;
		addend = 1;
	}
	else {
		window.normalRate.totalNumber -= 2;
		addend = -1;
	}

	for (i in dataIn) {

		if( i.indexOf("温区") != -1 ) {
			var index = i.slice(0, i.indexOf("温区")) - 1,
				different = dataIn[i] - paramObject.thresholdT[index];
			if ( Math.abs(different) > param.limit ) {
				window.normalRate.alertNumber[index] += addend;
			}
		}
	};
}

/*计算CPK值*/
function cpkData (dataIn, addOrSub) {

	var param = window.paramObject;
	var addend;
	if (addOrSub == "add") {
		window.normalRate.totalNumber ++;
	}
	else {
		window.normalRate.totalNumber --;
	}
	for (i in dataIn) {

		if( i.indexOf("温区") != -1 ) {
			var index = i.slice(0, i.indexOf("温区")) - 1;
			var d = parseInt(dataIn[i]);
			if (addOrSub == "add") {
				
				if (i.indexOf("上") != -1) {
					window.normalRate.total[index].top += d;
			 		window.normalRate.cpkData[index].top.push(d);
				}
				else {
					window.normalRate.total[index].bottom += d;
			 		window.normalRate.cpkData[index].bottom.push(d);
				}
			}
			else {
				
				if (i.indexOf("上") != -1) {
					window.normalRate.total[index].top -= d;
			 		window.normalRate.cpkData[index].top.shift();
				}
				else {
					window.normalRate.total[index].bottom -=  d;
			 		window.normalRate.cpkData[index].bottom.shift();
				}
			}
		}

	};

	// console.log(window.normalRate)

}

function cpkCount (arr, total, th) {
	// console.log(arr.top.length)
	var cpk = 0;

	var variance = function (array, t) {
		var average = t / array.length,
			sum = 0;
		for (var i = 0; i < array.length; i++) {
			sum += Math.pow(array[i] - average, 2);
		};
		return sum / (array.length - 1);
	}

	for ( item in arr) {
		var sigma = Math.sqrt(variance(arr[item], total[item]));
			a = total[item] / arr[item].length,
			T = 2*window.paramObject.limit;

		var cp = sigma ? T / (6*sigma) : 2,
			ca = (a - th) / (T / 2);
		cpk += cp * (1 - Math.abs(ca));
		// console.log(arr[item], cpk)
	}
	// console.log(arr, total, th)
	return cpk/2;
}

/*获得变化趋势*/
function changeTrend (nowIndex, data) {
	var dataCount = [[], [], [], [], []];
	for (var i = 0; i <= 4; i ++) {
		var dataTemp = classification(data[nowIndex - i]);
		for (var j = 0; j < dataTemp[0].length; j++) {
			dataCount[i][j] = {top: parseInt(dataTemp[0][j]), bottom: parseInt(dataTemp[1][j])};
			if (i > 0 ) {
				if (window.normalRate.trend[j].length < i) {
					window.normalRate.trend[j].unshift(getTrend(dataCount[i][j], dataCount[i-1][j], window.paramObject.thresholdT[j]))
				}
				else {
					window.normalRate.trend[j][4-i] = getTrend(dataCount[i][j], dataCount[i-1][j], window.paramObject.thresholdT[j]);
				}
			}
			
		};		
	};
	// console.log(dataCount, window.normalRate.trend)
}

function getTrend (d1, d2, threshold) {
	// var thT1 = dealTrendData(d1.top - threshold),
	// 	thB1 = dealTrendData(d1.bottom - threshold);
	// 	thT2 = dealTrendData(d2.top - threshold),
	// 	thB2 = dealTrendData(d2.bottom - threshold);
	var thT1 = d1.top - threshold,
		thB1 = d1.bottom - threshold;
		thT2 = d2.top - threshold,
		thB2 = d2.bottom - threshold;
	var obj = {topTh: thT2 - thT1, bottomTh: thB2 - thB1}
	return obj;
}

// function dealTrendData (th) {
// 	if (th > 5) {
// 		if (th > 60) {
// 			th = 3;
// 		}
// 		else if ( th > 30) {
// 			th = 2;
// 		}
// 		else {
// 			th = 1;
// 		}
// 	}
// 	else if(th < -5) {
// 		if (th < -60) {
// 			th = -3;
// 		}
// 		else if (th < -30) {
// 			th = -2;
// 		}
// 		else {
// 			th = -1;
// 		}
// 	}
// 	else {
// 		th = 0;
// 	}
// 	return th;
// }

/*计算皮尔逊相关系数*/
function pearson (array1, array2) {
	var si = [],
		arr1 = [[], []],
		arr2 = [[], []];
	for (var i = 0; i < array1.length; i++) {
		arr1[0].push(array1[i].topTh + 1);
		arr1[1].push(array1[i].bottomTh + 1);
		arr2[0].push(array2[i].topTh + 1);
		arr2[1].push(array2[i].bottomTh + 1);
	};	

	var r1 = pearsonItem(arr1[0], arr2[0]),
		r2 = pearsonItem(arr1[1], arr2[1]);
	// console.log(r1, r2)
	return (r1 + r2)/2;
}

function pearsonItem (arr1, arr2) {
	var si = [];
	for (var i = 0; i < arr1.length; i++) {

		if (arr1[i] == arr2[i]) {
				si[i] = 1;
		}
		else {
			si[i] = 0;
		}

	};

	var m = si.filter(function (value) { return value != 0 }).length;
	if ( m < 2) {
		return 0;
	}
	var n = 4;
	function getSum(preValue,curValue,index, array) {
		return preValue + curValue;	
	}
	function getSumPower(preValue,curValue,index, array) {
		return preValue + Math.pow(curValue, 2);
	}
	var sum1 = arr1.reduce(getSum, 0),
		sum2 = arr2.reduce(getSum, 0),
		sum1Sq = arr1.reduce(getSumPower, 0),
		sum2Sq = arr2.reduce(getSumPower, 0),
		pSum = arr1.reduce(function (preValue,curValue,index, array) {
			// if (si[index] == 1) {
				return preValue + curValue * arr2[index];
			// }
			// else {
			// 	return preValue;
			// };
		}, 0);
	
	var num = pSum - (sum1 * sum2) / n;
		den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) * (sum2Sq - Math.pow(sum2, 2) / n));

	// console.log(arr1, arr2, si, num, den)
	if (den == 0) {
		return m/n;
	}
	else {
		return num/den;
	}
	
}