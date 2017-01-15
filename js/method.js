function classification (dataIn) {

	var dataMatrix = [[],[]];
	for (i in dataIn) {
		if( i.indexOf("温区") != -1 ) {
			if (i.indexOf("上") != -1) {
				dataMatrix[0].push(dataIn[i])
			}
			else {
				dataMatrix[1].push(dataIn[i])
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

