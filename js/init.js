var paramObject = {
	thresholdT: [360, 600, 700, 750, 750, 750, 750, 900, 1000, 1055, 1055, 1055, 1055, 1055, 1055, 1055, 1055, 1055, 1000, 950, 850],
	thresholdV: {V: 450, color: ["#fce0a6", "#fff"]},
	thresholdA: {A: 150, color: ["#8373b0", "#fff"]},
	// colorA: d3.rgb(223, 53, 57),
	// colorM1: d3.rgb(252, 217, 196),
	// colorM2: d3.rgb(191, 202, 230),
	// colorB: d3.rgb(16, 54, 103),
	colorH: ["#F5A89A", "#E54646", "#C50023"],
	colorL: ["#BFCAE6", "#426EB4", "#184785"],
	nomalColor: "#83c75d",
	// limit: {warming: 30, constant: 5, cooling: 10},
	limit: 5,
	alert: 15
};

$((function (p) {

	d3.csv = d3.dsv(",", "text/csv;charset=gb2312");

	// var lowColor = d3.interpolate(p.colorM1, p.colorB),
	// 	highColor = d3.interpolate(p.colorM2, p.colorA),
	var	l = p.limit,
		a = p.alert;

	window.paramObject = {
		thresholdT: p.thresholdT,
		thresholdV: p.thresholdV,
		thresholdA: p.thresholdA,
		alert: a,
		color:  function (th, value) {
					if(  th - value > l){
						if (th - value > 60) {
							return p.colorL[2];
						}
						else if (th - value > 30) {
							return p.colorL[1];
						}
						else {
							return p.colorL[0];
						}
						// return lowColor((th - value) / a)
					}
					else if (value - th > l) {
						if (value - th > 60) {
							return p.colorH[2]
						}
						else if (value - th > 60) {
							return p.colorH[1];
						}
						else {
							return p.colorH[0];
						}
						// return highColor( (value - th) / a );
					}
					else 
						return p.nomalColor;
				}
	};

})(paramObject))
