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
	var thT1 = dealTrendData(d1.top - threshold),
		thB1 = dealTrendData(d1.bottom - threshold),
		thT2 = dealTrendData(d2.top - threshold),
		thB2 = dealTrendData(d2.bottom - threshold);
	
	if (thT2 > thT1 || thB2 > thB1) {
		return 1;
	}
	else if (thT2 < thT1 || thB2 < thB1) {
		return -1;
	}
	else {
		return 0;
	}
}

function dealTrendData (th) {
	if (th > 5) {
		if (th > 60) {
			th = 3;
		}
		else if ( th > 30) {
			th = 2;
		}
		else {
			th = 1;
		}
	}
	else if(th < -5) {
		if (th < -60) {
			th = -3;
		}
		else if (th < -30) {
			th = -2;
		}
		else {
			th = -1;
		}
	}
	else {
		th = 0;
	}
	return th;
}