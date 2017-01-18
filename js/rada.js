	/*
	创建雷达图
	attr: {
		container: 容器,
		startAngle: 初始角度,
		endAngle: 结束角度,
		eleAngle: 单元角度,
		dataRank: [min, max],
		areaBegin: 开始的温区编号 缺省为0,
		areaNum: 温区数量,
		radius: 雷达半径,
		data: {top: [], bottom: []}
	}
*/
function radar(ob) {

	var _radar = {};

	var c = ob.container,
		startAngle = ob.startAngle,
		endAngle = ob.endAngle,
		areaBegin = ob.areaBegin,
		radius = ob.radius,
		eleAngle = ob.eleAngle;
		dataBind = ob.data;
	var areaPart = [];

	for (var i = 0; i < ob.areaNum; i++) {
		areaPart.push(1);
	};

	

	//绘制雷达区域
	var arc = function (outerRadius) {
		return d3.svg.arc()
					.startAngle(function (d, i) {
						return startAngle + eleAngle * i;
					})	
					.endAngle(function (d, i) {
						return startAngle + eleAngle * (i + 1);
					})
					.innerRadius(0)
					.outerRadius(outerRadius);
	}
	var group = c.append("g")
					.attr("class", "radaGroup radaGroup-" + areaBegin)
					.attr("transform", "translate(" + 375 + "," + 375 + ")")

	for (var j = 0; j < 6; j++) {
		group.selectAll("path.arc-" + j)
			.data(areaPart)
			.enter()
			.append("path")
			.attr("d", function (d, i) {
				var partRadius = radius/6 * (j + 1);
				return arc(partRadius)(d, i)
			})
			.attr("fill", "#dbdede")
			.attr("stroke-width", "1px")
			.attr("stroke", "#d5d5d5")
	};

	//处理数据
	// function dealPoint (d, attr) {
	// 	var paintD = "0,0 ";
	// 	var dataBind = d;
	// 	dataBind[attr + "Points"] = [];
	// 	for (var i = 0; i < dataBind[attr].length; i++) {
	// 		var r, value = dataBind[attr][i],
	//     		angle = startAngle + eleAngle * (i + 0.5) - Math.PI/2;	

	//     	// if (value < 0) {
	//     	// 	r = 0;
	//     	// }
	//     	// else if (value > 2) {
	//     	// 	r =  radius;
	//     	// }
	//     	// else {
	//     	// 	r = value / 2 * radius;
	//     	// }
	//     	// var x = r * Math.cos(angle),
	//     	// 	y = r * Math.sin(angle);
	//     	// paintD += x + ',' + y + ' ';
	// 		// dataBind[attr + "Points"].push({
	// 		// 	x: x,
	// 		// 	y: y
	// 		// });
	// 		dataBind[attr + "Points"].push(value);
	// 	};
	// 	dataBind[attr + "PaintD"] = paintD;
	// 	return dataBind;
	// }
	var type = ["top", "bottom"], polygons = [], circlePoint = [];

	//绘制曲线函数
	// for (var j = 0; j < type.length; j++) {
		// if (type[j] == "bottom") {
		// 	var color = "#63c9f3",
		// 		fillColor = "rgba(99, 201, 243, .6)";
		// }
		// else {
		// 	var color = "#F6B297",
		// 		fillColor = "rgba(246, 178, 151, 1)";
		// }
		 
		//绘制曲线区域
		var paintG = c.append("g")
							.attr("class", "radaGroup " + "Line")
							.attr("transform", "translate(" + 375 + "," + 375 + ")");
		//处理数据
		// dataBind = dealPoint(dataBind, type[j]);

		//绘制曲线图
		// var polygon = paintG.append("polygon")
		// 				.attr("class", "polygon" + type[j])
		// 				.attr("points", dataBind[type[j] + "PaintD"])
		// 				.attr("stroke", color)
		// 				.attr("fill", fillColor)
		// 				.on("mouseover", function () {
		// 					var lx = d3.event.x;
		// 					var ty = d3.event.y;
							
		// 					d3.select("#tooltip")
		// 							.html("报警分布情况")
		// 							.style("left",lx + 'px')
		// 							.style("top",ty + 'px')
		// 							.style("width","auto")
		// 							.classed("hidden",false);
		// 				})
		// 				.on("mouseout",function (d,i) {
		// 					d3.select("#tooltip").classed("hidden",true);
		// 				})
		// polygons.push(polygon);
		var polygon =  paintG.selectAll("path.arcPoint")
							.data(dataBind)
							.enter()
							.append("path")
							.attr("d", function (d, i) {
								// console.log(d)
								if (d < 0) {
						    		r = 0;
						    	}
						    	else if (d >= 2) {
						    		r =  radius;
						    	}
						    	else {
						    		r = d / 2 * radius;
						    	}
						    	// console.log(r)
								return arc(r)(1, i)
							})
							.attr("fill", function (d, i) {
								if (d < 1.33) {
									return "#F6B297";
								}
								else {
									return "#98D0B9";
								}
							})
							.attr("stroke-width", "1px")
							.attr("stroke", "#dbdede")
							.on("mouseover", function () {
								var lx = d3.event.x;
								var ty = d3.event.y;
								
								d3.select("#tooltip")
										.html("CPK值<br>绿色为CAPABLE<br>红色为NOT CAPABLE<br>值为0代表超出正常范围")
										.style("left",lx + 'px')
										.style("top",ty + 'px')
										.style("width","auto")
										.classed("hidden",false);
							})
							.on("mouseout",function (d,i) {
								d3.select("#tooltip").classed("hidden",true);
							})
		// polygons.push(polygon);

		//绘制曲线上的点
		// var circles = paintG.append('g')
		// 			   .classed('circles' + type[j], true);
		// var circle = circles.selectAll('circle')
		// 						.data(dataBind[type[j] + "Points"])
		// 						.enter()
		// 						.append('circle')
		// 						.attr('cx', function(d) {
		// 							return d.x;
		// 						})
		// 						.attr('cy', function(d) {
		// 							return d.y;
		// 						})
		// 						.attr('r', 2)
		// 						.attr("fill", "#fff")
		// 						.attr('stroke', color);
		// circlePoint.push(circle)
	// }

	// paintCurve("top");	//上温区电压
	// paintCurve("bottom");	//下温区电压

	_radar.update = function (rateData) {
		
		// for (var i = 0; i < type.length; i++) {
			// var dataBind = dealPoint(rateData, type[i]);
			polygon.data(rateData)
				.transition()
				.duration(500)
				.attr("d", function (d, i) {
					// console.log(d)
					if (d < 0) {
						r = 0;
					}
					else if (d >= 2) {
						r =  radius;
					}
					else {
						r = d / 2 * radius;
					}
					return arc(r)(1, i)
				})
				.attr("fill", function (d, i) {
					if (d < 1.33) {
						return "#F6B297";
					}
					else {
						return "#98D0B9";
					}
				})
				// .attr("points", dataBind[type[i] + "PaintD"]);

			// circlePoint[i].data(dataBind[type[i] + "Points"])
			// 	.transition()
			// 	.duration(500)
			// 	.attr('cx', function(d) {
			// 		return d.x;
			// 	})
			// 	.attr('cy', function(d) {
			// 		return d.y;
			// 	})
		// };
		
	}

	return _radar;

}