/*
	创建雷达图
	attr: {
		container: 容器,
		startAngle: 初始角度,
		endAngle: 结束角度,
		dataRank: [min, max],
		areaBegin: 开始的温区编号 缺省为0,
		areaNum: 温区数量,
		radius: 雷达半径,
		data: {top: [], bottom: []}
	}
*/
function rada(ob) {

	var c = ob.container,
		startAngle = ob.startAngle,
		endAngle = ob.endAngle,
		areaBegin = ob.areaBegin,
		radius = ob.radius,
		dataBind = ob.data;

	var areaPart = [];

	for (var i = 0; i < ob.areaNum; i++) {
		areaPart.push(1);
	};

	var eleAngle = (endAngle - startAngle) / ob.areaNum;

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
					.attr("transform", "translate(" + 300 + "," + 300 + ")")

	for (var j = 0; j < 6; j++) {
		group.selectAll("path.arc-" + j)
			.data(areaPart)
			.enter()
			.append("path")
			.attr("d", function (d, i) {
				var partRadius = radius/6 * (j + 1);
				return arc(partRadius)(d, i)
			})
			.attr("fill", "none")
			.attr("stroke-width", "1px")
			.attr("stroke", "#dbdede")
	};

	//绘制曲线函数
	function paintCurve (attr) {
		var threshold = window.paramObject.thresholdV.V;
		if (attr == "bottom") {
			var color = "#63c9f3",
				fillColor = "rgba(99, 201, 243, .6)";
		}
		else {
			var color = "#f6b16d",
				fillColor = "rgba(246, 177, 109, .6)";
		}
		 
		//绘制曲线区域
		var paintG = c.append("g")
							.attr("class", attr + "Line")
							.attr("transform", "translate(" + 300 + "," + 300 + ")");

		//处理数据
		var paintD = "0,0 ";
		dataBind[attr + "Points"] = [];
		for (var i = 0; i < dataBind[attr].length; i++) {
			var value = dataBind[attr][i],
	    		r = value / threshold * radius,
	    		angle = startAngle + eleAngle * (i + 0.5) - Math.PI/2;	

	    	var x = r * Math.cos(angle),
	    		y = r * Math.sin(angle);
	    	paintD += x + ',' + y + ' ';
			dataBind[attr + "Points"].push({
				x: x,
				y: y
			});
		};

		//绘制曲线图
		paintG.append("polygon")
					.attr("points", paintD)
					.attr("stroke", color)
					.attr("fill", fillColor);

		//绘制曲线上的点
		var circles = paintG.append('g')
					   .classed('circlesV', true);
		circles.selectAll('circle')
				.data(dataBind[attr + "Points"])
				.enter()
				.append('circle')
				.attr('cx', function(d) {
					return d.x;
				})
				.attr('cy', function(d) {
					return d.y;
				})
				.attr('r', 2)
				.attr("fill", "#fff")
				.attr('stroke', color);
	}

	paintCurve("top");	//上温区电压
	paintCurve("bottom");	//下温区电压

}