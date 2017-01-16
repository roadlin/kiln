/*构建弧形矩阵
	@param type:obeject
	attr: {
		container: 容器,
		rows: 行数,
		cols: 列数,
		startAngle: 起始角度,
		endAngle: 结束角度,
		areaBegin: 缺省为0,
		beginRadius: 最内围的内部半径,
		eleRadius: 每个环的高度,
		tempData: rows*cols矩阵
		vData: rows*cols矩阵{voltage: value, current: value}
	}
*/
function arcsMatrix (ob, time) {

	var _arcsMatrix = {};

	var c = ob.container,
		rows = ob.rows,
		cols = ob.cols,
		startAngle = ob.startAngle,
		endAngle = ob.endAngle,
		areaBegin = ob.areaBegin ? ob.areaBegin : 0,
		eleRadius = ob.eleRadius,
		beginRadius = ob.beginRadius,
		dataBind = ob.tempData,
		vDataBind = ob.vData;

	var eleAngle = (endAngle - startAngle) / cols;
	if (time.length > 6) 
		time = "now";

	var groups = c.selectAll("g.arcsGroup" + " " + "area-" + areaBegin + " t" + time)
						.data(dataBind)
						.enter()
						.append("g")
						.attr("class", function (d, i) {
							return "arcsGroup arcsGroup-" + (dataBind.length - i);
						})
						.attr("transform", "translate(" + 375 + "," + 375 + ")");

	var vGroups = c.selectAll("g.vGroup" + " " + "area-" + areaBegin + " t" + time)
						.data(vDataBind)
						.enter()
						.append("g")
						.attr("class", function (d, i) {
							return "vGroup vGroup-" + (vDataBind.length - i);
						})
						.attr("transform", "translate(" + 375 + "," + 375 + ")");


	var arc = function (innerRadius, outerRadius, type) {
		return d3.svg.arc()
					.startAngle(function (d, i) {
						if (type == "temp") {
							return startAngle + eleAngle * i + eleAngle * 0.2;	
						}
						// else if (type == "padding") {
						// 	return  startAngle + eleAngle * (i + 1) - eleAngle * 0.1;
						// }
						else if (type == "voltage") {
							var start = startAngle + eleAngle * i;
							
						}
						else if (type == "current"){
							var start = startAngle + eleAngle * i + eleAngle * 0.1;
						}
						if (typeof outerRadius == "number") {
							return start;
						}
						else 
							return start + eleAngle * 0.01;
					})	
					.endAngle(function (d, i) {
						if (type == "temp") {
							return startAngle + eleAngle * (i + 1) - eleAngle * 0.1;
						}
						// else if (type == "padding") {
						// 	return startAngle + eleAngle * (i + 1);
						// }
						else if (type == "voltage") {
							var end = startAngle + eleAngle * i + eleAngle * 0.1 ;
						}
						else if (type == "current") {
							var end = startAngle + eleAngle * i + eleAngle * 0.2;
						}
						if (typeof outerRadius == "number") {
							return end;
						}
						else 
							return end - eleAngle * 0.01;						
					})
					.innerRadius(function (d, i) {
						if (typeof outerRadius == "number") { 
							return innerRadius;
						}
						else {
							var threshold = type == "voltage" ? window.paramObject.thresholdV.V : window.paramObject.thresholdA.A;
							return getRank(d, threshold) ? innerRadius + 0.5 : innerRadius
						}
						 
					})
					.outerRadius(function (d, i) {
						if (typeof outerRadius == "number") {
							return outerRadius
						}
						else {
							var threshold = type == "voltage" ? window.paramObject.thresholdV.V : window.paramObject.thresholdA.A;
							return getRank(d, threshold) ? (innerRadius + (eleRadius) / 3 * getRank(d, threshold) - 0.5) : innerRadius;
						}
					});
	}
	//绘制温度颜色块
	var tempArc = groups.selectAll("path.arc")
			.data(function (d) {
				return d;
			})
			.enter()
			.append("path")
			.attr("d", function (d, i) {
				var className = $(this).parent().attr("class"),
					index = className.slice(className.indexOf("-")+1, className.length),
					innerRadius = (index - 1) * eleRadius + beginRadius;
				return arc(innerRadius, innerRadius + eleRadius, "temp")(d, i);
			})
			.attr("fill", function (d, i) {
				th = window.paramObject.thresholdT[i + areaBegin]
				return window.paramObject.color(th, d)
			})
			.attr("class", "arc")
			.attr("stroke-width", "1px")
			.attr("stroke", "#aaa")
			.on("mouseover", function (d,i) {

				var className = $(this).parent().attr("class"),
					index = 2 - className.slice(className.indexOf("-")+1, className.length);

				var text = index ? "下" : "上";
				var lx = d3.event.x;
				var ty = d3.event.y;
				d3.select(this)
						.attr("fill","orange");
				d3.select("#tooltip")
						.html(function () {
							return ((i + areaBegin + 1) + "温区" + text + "<br>设定温度：" + window.paramObject.thresholdT[i + areaBegin] + "℃ <br>温度:" + d + "℃<br>电压：" + vDataBind[index][i].voltage + "V <br>电流：" + vDataBind[index][i].current + "A")
						})
						.style("left",lx + 'px')
						.style("top",ty + 'px')
						.style("width","auto")
						.classed("hidden",false);

			})
			.on("mouseout",function (d,i) {

				d3.select(this).attr("fill",function (d) {
					th = window.paramObject.thresholdT[i + areaBegin]
					return window.paramObject.color(th, d)
				});
				d3.select("#tooltip").classed("hidden",true);

			})

	//初始化两侧电流电压块
	var typeStr = ["voltage", "current"],
		colorHex = ["#D7D7D7", "#D7D7D7"];
		// colorHex = ["#fce0a6", "#8373b0"];
	var bars = [], barContainers = [];
	for (var j = 0; j < typeStr.length; j++) {
		var barContainer = vGroups.selectAll("path.arc-" + typeStr[j])
								.data(function (d) {
									return d;
								})
								.enter()
								.append("path")
								.attr("d", function (d, i) {
									var className = $(this).parent().attr("class"),
										index = className.slice(className.indexOf("-")+1, className.length),
										innerRadius = (index - 1) * eleRadius + beginRadius;
									return arc(innerRadius, innerRadius + eleRadius, typeStr[j])(d, i);
								})
								.attr("fill", "#fff")
								// .attr("fill", "#dbdede")
								.attr("class", "arc-" + typeStr[j])
								.attr("stroke-width", "1px")
								.attr("stroke", function (d, i) {
									if ( d[typeStr[j]] == 0 ) {
										return "#EE7C6B";
									}
									else {
										return "#aaa";
									}
								})

		var bar = vGroups.selectAll("path.vArc-" + typeStr[j])
							.data(function (d) {
								return d;
							})
							.enter()
							.append("path")
							.attr("d", function (d, i) {
								var className = $(this).parent().attr("class"),
									index = className.slice(className.indexOf("-")+1, className.length),
									innerRadius = (index - 1) * eleRadius + beginRadius;
								return arc(innerRadius, "auto", typeStr[j])(d[typeStr[j]], i);
							})
							.attr("fill", colorHex[j])
							.attr("class", "vArc-" + typeStr[j]);
		barContainers.push(barContainer);
		bars.push(bar);
						
	};

	_arcsMatrix.update = function (data, vData) {
		groups.data(data);
		tempArc.data(function (d) {
					return d;
				})
				.transition()
				.duration(500)
				.attr("fill",function (d, i) {
					th = window.paramObject.thresholdT[i + areaBegin]
					return window.paramObject.color(th, d)
				});

		vGroups.data(vData);
		for (var j = 0; j < typeStr.length; j++) {
			bars[j].data(function (d) {
					return d;
				})
				.transition()
				.duration(500)
				.attr("d", function (d, i) {
					var className = $(this).parent().attr("class"),
						index = className.slice(className.indexOf("-")+1, className.length),
						innerRadius = (index - 1) * eleRadius + beginRadius;
					return arc(innerRadius, "auto", typeStr[j])(d[typeStr[j]], i);
				})
				.attr("fill", colorHex[j]);

			barContainers[j].data(function (d) {
				return d;
			})
			.transition()
			.duration(500)
			.attr("stroke", function (d, i) {
				if ( d[typeStr[j]] == 0 ) {
					return "#EE7C6B";
				}
				else {
					return "#aaa";
				}
			})
		}
	}

	return _arcsMatrix;

}
/*绘制弧形标签云
	attr: {
		container: 容器，
		tagData: 标签云数组，
		radius: 半径,
		eleAngle: 单元角度，
		beginAngle: 开始角度,
		flag: 标志位
	}
*/

function  addTag(ob) {
	var c = ob.container,
		eleAngle = ob.eleAngle,
		tagData = ob.tagData,
		beginAngle = ob.beginAngle;

	var group = c.append("g")
					.attr("class", "tagG")
					.attr("transform", "translate(375, 375)");

	var cloudG = group.selectAll("g.tagCloud" + ob.flag)
					.data(tagData)
					.enter()
					.append("g")
					.attr("class", "tagCloud" + ob.flag)
					.attr("dataIndex", function (d, i) {
						return i;
					})

	cloudG.selectAll("text")
			.data(function (d) {
				var arr = d.split(",");
				return arr;
			})
			.enter()
			.append("text")
			.attr("transform", function (d, i) {
				var index = $(this).parent()[0].getAttribute("dataIndex");
				var angle = beginAngle + eleAngle*(index) - Math.PI/2;
				if (i >= 2 || d.length > 3) {
					angle += eleAngle/2
					r = ob.radius;
				}
				else {
					if (i == 0) {
						angle += (0.05 * eleAngle);
					}
					else {
						angle += (0.15 * eleAngle);
					}
					r = ob.radius - 25;
				}				
				return "translate("+ r*Math.cos(angle) + "," + r*Math.sin(angle) +"), rotate("+ (angle / (2*Math.PI) *360 + 90) + ")";
			})
			.attr("font-size", "12px")
			.attr("text-anchor", "middle")
			.text(function (d) {
				return d;
			})
	
}

/*绘制坐标
	container: 容器,
	point: [起始坐标{x: ,y: }, 目的坐标{x: ,y: }]
*/
function addAxis (container, point, timeArray) {

	var _axis = {};
	var axisG = container.append("g")
					.attr("class", "axisG")
					.attr("transform", "translate(375, 375)");
	// 绘制箭头
// 	var defs = axisG.append("defs");  
//   
// 	var arrowMarker = defs.append("marker")  
//                         .attr("id","arrow")  
//                         .attr("markerUnits","strokeWidth")  
//                         .attr("markerWidth","12")  
//                         .attr("markerHeight","12")  
//                         .attr("viewBox","0 0 12 12")   
//                         .attr("refX","6")  
//                         .attr("refY","6")  
//                         .attr("orient","auto");  
//   
// 	var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";  
//                           
// 	arrowMarker.append("path")  
//             .attr("d",arrow_path)  
//             .attr("fill","#D7D7D7");  

	// 绘制直线
	var r = [270, 205, 172, 139, 106];
		angle = -Math.PI/2;

	// for (var j = 0; j < 2; j++) {

	// 	if (j == 0) {
	// 		var tempAngle = - 6/360 * 2*Math.PI * 1.5;
	// 	}
	// 	else {
	// 		var tempAngle = 6/360 * 2*Math.PI * 1.5
	// 	}
		var tempAngle = 6/360 * 2*Math.PI * 1.5
		axisG.selectAll("path.timeLine")
			.data(timeArray)
			.enter()
			.append("path")
			.attr("class", "timeLine")
			.attr("d", function (d, i) {
				var x1 = r[i]*Math.cos(angle - tempAngle),
					y1 = r[i]*Math.sin(angle - tempAngle),
					x2 = r[i]*Math.cos(angle + tempAngle),
					y2 = r[i]*Math.sin(angle + tempAngle);
				var descriptions = ['M', x1, y1, 'A', r[i], r[i], 0, 0, 1, x2, y2];
				return descriptions.join(' ');
			})
			.attr("fill", "none")
			.attr("stroke-width", "1px")
			.attr("stroke", "#aaa")
			.attr("stroke-dasharray", "2,2")
		

		// axisG.selectAll("line.timeLine-" + j)
		// 	.data(timeArray)
		// 	.enter()
		// 	.append("line")
		// 	.attr("class", "timeLine-" + j)
		// 	.attr("x1", function (d, i) {
		// 		return r[i]*Math.cos(angle + tempAngle);
		// 	})
		// 	.attr("y1", function (d, i) {
		// 		return r[i]*Math.sin(angle);
		// 	})
		// 	.attr("x2", function (d, i) {
		// 		return r[i]*Math.cos(angle + tempAngle/2);
		// 	})
		// 	.attr("y2", function (d, i) {
		// 		return r[i]*Math.sin(angle);
		// 	})
		// 	.attr("stroke-width", "1px")
		// 	.attr("stroke", "#aaa")
		// 	.attr("stroke-dasharray", "5,5")

	// };


	var tempTime = timeArray[0].split(" ");
	timeArray[0] = tempTime[0];
	timeArray.push(tempTime[1]);
	timeArray.push("设定温度", "1号窑炉");
	//绘制时间线
	var timeText = axisG.selectAll("text.timeText")
						.data(timeArray)
						.enter()
						.append("text")
						.attr("class", "timeText")
						.attr("transform", function (d, i) {
							var r = [273, 201, 168, 135, 102, 253, 333, 352],	
								angle = -90/360 * 2 *Math.PI;
							return "translate("+ r[i]*Math.cos(angle) + "," + r[i]*Math.sin(angle) +")"
						})
						.attr("font-size", "12px")
						.attr("font-family", "微软雅黑")
						.attr("font-weight", "bold")
						.attr("fill", function (d, i) {
							if (i < 6) {
								return "#555";
							}
							else {
								return "#B7B7B7"
							}
						})
						.attr("text-anchor", "middle")
						.text(function (d, i) {
							return d;
						})

	_axis.update = function  (timeArray1) {
		var tempTime = timeArray1[0].split(" ");
			timeArray1[0] = tempTime[0];
			timeArray1.push(tempTime[1]);

		timeText.data(timeArray1)
				.transition()
				.duration(500)
				.text(function (d, i) {
					return d
				})
	}


	return _axis;
}

/*
	绘制外圈区域环
	attr: {
		container: 容器,
		startAngle: 开始的角度,
		endAngle: 结束角度,
		innerRaius: 半径,
		color: 填充颜色,
		areaName: 区域名称
	}
*/
function setRing (ob) {
	var c = ob.container,
		sA = ob.startAngle,
		eA = ob.endAngle,
		color = ob.color,
		iR = ob.innerRadius,
		oR = ob.outerRadius ? ob.outerRadius : iR + 35;
		name = ob.areaName;

	if ( !color ) {
		var group = c.append("g")
						.attr("class", "gradient");
		var gradient = group.append("defs");

		var r = (iR + oR) / 2,
			offset1 = name == "降  温  段" ? 1 : 0;

		var lineGradient = gradient.append("linearGradient")
									.attr("id", "grayGradient-" + offset1)
									.attr({
										"x1": "0%",
										"y1": "0%",
										"x2": "0%",
										"y2": "100%"
									});

		lineGradient.append("stop")
						.attr("offset", 0)
						.style({
							"stop-color": "rgb(250, 250, 250)",
							"stop-opacity": 1
						})

		lineGradient.append("stop")
						.attr("offset", 1)
						.style({
							"stop-color": "rgb(137, 137, 137)",
							"stop-opacity": 1
						})
		
		color = "url(#grayGradient-" + offset1 + ")"
	}
	var arc = d3.svg.arc()
					.innerRadius(iR)
					.outerRadius(oR)
					.startAngle(sA)
					.endAngle(eA);

	var areaArc = c.append("g")
					.attr("transform", "translate(375, 375)")
					.classed("areaArc", true);

	var arcs = areaArc.selectAll("path.arc")
						.data([1])
						.enter()
						.append("path")
						.attr("class", "arc")
						.attr("fill", color)
						.attr("d", arc);

	if (name != "undefined") {
		var textAngle =  -Math.PI /2 + (sA + eA) / 2;
		arcs.attr("stroke", "#D7D7D7")
				.attr("stroke-width", "2px");

		areaArc.append("text")
				.attr("text-anchor", "middle")
				.attr("transform", "translate("+ (iR + 20) * Math.cos(textAngle) + "," + (iR + 20) * Math.sin(textAngle) + ") rotate("+ (textAngle*360 / (2 * Math.PI) + 90) + ")")
				.attr("font-size", "12px")
				.attr("font-family", "幼圆")
				.attr("font-weight", "bold")
				.text(name)
				.attr("xml:space", "preserve")
	}	

}

/*绘制完整的温区
	attr: {
		container: 容器,
		tempData: 2*21温区的数组,
		vData: 2*21温区的数组,
		beginArray: 分区数组，元素为{begin: value, len: value}
		beginRadius: 内围开始的半径,
		eleRadius: 每个单元的高度,
		eleAngle: 每个单元所占的角度,
		time: 时间
	}
*/
function wholeArea (ob) {
	
	var _wholeArea = {};
	var matrixes = [];
	var area = [{name: "升  温  段", color: ""}, {name: "恒  温  段", color: "#898989"}, {name: "降  温  段", color: ""}]
	for (var i = 0; i < beginArray.length; i++) {
		var b = ob.beginArray[i].begin,
			l = ob.beginArray[i].len,
			offsetIndex = i;

		sA= ob.eleAngle * (b + 0.05) + 6/360 * 2*Math.PI* (offsetIndex + 1.5),
		eA = ob.eleAngle * (b + l + 0.05) + 6/360 * 2*Math.PI* (offsetIndex + 1.5);

		var arcs = arcsMatrix({
							container: ob.container,
							rows: 2,
							cols: l,
							startAngle: sA,
							endAngle: eA,
							beginRadius: ob.beginRadius,
							eleRadius: ob.eleRadius,
							areaBegin: b,
							tempData: [ob.tempData[0].slice(b, b + l), ob.tempData[1].slice(b, b + l)],
							vData: [ob.vData[0].slice(b, b + l), ob.vData[1].slice(b, b + l)]
						}, ob.time);
		matrixes.push(arcs);
		
		if (ob.time == "now") {
			var tagData = [];
			for (var j = b; j < b+l; j++) {
				tagData.push( "U,I," + "温区" + (j + 1) );
			};
			addTag({
				container: ob.container,
				tagData: tagData,
				radius: 312,
				eleAngle: ob.eleAngle,
				beginAngle: sA,
				flag: offsetIndex
			});
			
			setRing({
				container: ob.container,
				startAngle: sA,
				endAngle: eA - ob.eleAngle*0.1,
				innerRadius: ob.beginRadius + 2*ob.eleRadius + 30,
				color: area[i].color,
				areaName: area[i].name
			});

			addTag({
				container: ob.container,
				tagData: window.paramObject.thresholdT.map(function (value, index, array) {
					return value + "℃"
				}).slice(b, (b+l)),
				radius: 335,
				eleAngle: ob.eleAngle,
				beginAngle: sA,
				flag: offsetIndex
			})
			
		}

	};

	_wholeArea.update = function (tempData, vData) {
		for (var i = 0; i < beginArray.length; i++) {
			var b = ob.beginArray[i].begin,
				l = ob.beginArray[i].len,
				offsetIndex = i;

			matrixes[i].update([tempData[0].slice(b, b + l), tempData[1].slice(b, b + l)],[vData[0].slice(b, b + l), vData[1].slice(b, b + l)])
		}
	}

	return _wholeArea;

}

/*画出整个雷达图
	attr: {
		container: 容器,
		beginArray: 分区数组，元素为{begin: value, len: value}
		radius: 雷达半径
		eleAngle: 每个单元所占的角度
	}
*/
function wholeRadar (ob) {
	var _wholeRadar = {};
	var radarArray = [];

	for (var i = 0; i < beginArray.length; i++) {

		var b = ob.beginArray[i].begin,
			l = ob.beginArray[i].len,
			offsetIndex = i,
			tempRate = {top: [], bottom: []};

		sA= ob.eleAngle * (b + 0.05) + 6/360 * 2*Math.PI* (offsetIndex + 1.5),
		eA = ob.eleAngle * (b + l + 0.05) + 6/360 * 2*Math.PI* (offsetIndex + 1.5);
		for (var j = b; j < b + l; j++) {
			tempRate.top.push(window.normalRate.topNormal[j]);
			tempRate.bottom.push(window.normalRate.bottomNormal[j]);
		};
		
		var rateRadar = radar({
							container: ob.container,
							startAngle: sA,
							endAngle: eA,
							eleAngle: ob.eleAngle,
							areaBegin: b,
							areaNum: l,
							radius: ob.radius,
							data: tempRate
					});
		radarArray.push(rateRadar);

	}

	_wholeRadar.update = function () {
		for (var i = 0; i < radarArray.length; i++) {
			var b = ob.beginArray[i].begin,
				l = ob.beginArray[i].len,
				tempRate = {top: [], bottom: []};
			for (var j = b; j < b + l; j++) {
				tempRate.top.push(window.normalRate.topNormal[j]);
				tempRate.bottom.push(window.normalRate.bottomNormal[j]);
			};
			radarArray[i].update(tempRate);
		};
	}

	return _wholeRadar;
}

/*
	计算数据值等级
*/
function getRank (value, threshold) {
	var eleValue = threshold / 3;
	return Math.ceil(value / eleValue);
}