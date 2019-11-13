class Bubble {
    constructor(data,updateBrush, selectedData){
        this.data = data;
        this.updateBrush = updateBrush;
        this.selectedData = selectedData;

        this.margin = {
            top: 20,
            right: 20,
            bottom: 10,
            left: 20
        };
        this.width = 900 -this.margin.left-this.margin.right;
        this.height = 20;

        this.sectors = d3.nest()
            .key(function(d){
                return d.category;
            })
            .entries(data);
        this.overall = [{"key": "economy/fiscal issues", "values":this.data}];

        this.tempData = this.overall.slice();

        this.colorscale = d3.scaleOrdinal(d3.schemeSet2);

        let maxCount = d3.max(this.data,d=> parseFloat(d.total));

        this.sizescale = d3.scaleLinear()
            .domain([0,maxCount])
            .range([2,11]);

        let maxcx = d3.max(this.data,d=>d.sourceX);
        let mincx = d3.min(this.data,d=>d.sourceX);

        this.cxscale = d3.scaleLinear()
            .domain([mincx,maxcx])
            .range([0,this.width-this.margin.left-this.margin.right])


        this.axisscale = d3.scaleLinear()
            .domain([-50,60])
            //.domain([minax,minax])
            .range([0,this.width-this.margin.left-this.margin.right]);
            //.nice();

        //this.view = this.data;
        this.creatBubble();
        this.list={
            "economy/fiscal issues":0,
            "energy/environment":1,
            "crime/justice":2,
            "education":3,
            "health care":4,
            "mental health/substance abuse":5
        };


    }
    creatBubble(){
        let that = this;

        this.svgGroup = d3.select(".g-graphic").append("svg")
            .attr("class","bubbleView")
            .attr("height",910+this.margin.top+this.margin.bottom)
            .attr("width",this.width+this.margin.left + this.margin.right)
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.svgGroup.append("g").append("text")
            .attr("x", 0)
            .attr("y",this.margin.top-10)
            .style("font-weight", "bold")
            .attr("font-size","14px")
            .text("Democratic Learning");

        this.svgGroup.append("g").append("text")
            .attr("x", this.width-180)
            .attr("y",this.margin.top-10)
            .style("font-weight", "bold")
            .attr("font-size","14px")
            .text("Republican Learning");


        //this.svgGroup.select(".label").attr("transform","translate(20,20)");
        // ---------------draw axis---------------
        let ticks = [-50,-40,-30,-20,-10,0,10,20,30,40,50,60];
        let tickLabels = [50,40,30,20,10,0,10,20,30,40,50,60];

        let xAxis = d3.axisBottom()
            .scale(that.axisscale)
            .tickValues(ticks)
            .tickFormat(function(d,i){
                return tickLabels[i]
            });

        this.svgGroup.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("class","g-x g-axis")
            .call(xAxis)
            .attr("font-weight", "bold");

        this.tooltip = d3.select(".g-graphic").append("div")
            .attr("class","tooltip")
            .style("visibility", "hidden");

        // ---------------draw overall line---------------
        this.svgGroup.append("g")
            .attr("class","g-overline")
            .attr("transform","translate("+(this.axisscale(0)+this.margin.left)+",120)")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("stroke-opacity",0.5)
            .attr("fill-opacity",0.5)
            .append("line")
            .attr("y1", -60)
            .attr("y2", 60);


        // ---------------draw overall graphic---------------
        let overlook = this.svgGroup.append("g")
            .attr("class","g-sector")
            .append("g")
            .attr("class","transition0")
            .attr("transform","translate( "+ that.margin.left + ",120)");

        d3.select(".transition0").append("g")
            .attr("class","Brush")
            .call(d3.brushX()
                .extent([[-20, -60], [850, 60]])
                .on("start", this.brushStart)
                .on("brush end",this.brushBubble.bind(that))
            );

        overlook.selectAll("circle").data(this.data)
            .enter().append("circle")
            .attr("cx", d=>this.cxscale(d.sourceX))
            .attr("cy", d=> d.sourceY)
            .attr("r", d=> this.sizescale(d.total))
            //.style("fill","grey");
            .style("fill", d=> this.colorscale(d.category));


        d3.selectAll("circle")
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseout", this.mouseout);

        d3.select(".g-graphic")
            .on("click", this.clearBrush.bind(that));

        d3.select(".bubbleView")
            .on("click",this.hiddenExtremes);

        d3.select(".g-button").on("click", this.showExtremes.bind(that));

        this.updateList();
    }

    function
    updateBubble(data){
        d3.select(".extremes-group").remove();
        d3.select(".Brush").remove();
        d3.select(".g-sector").remove();
        d3.select(".g-table").style("opacity", 1);
        d3.select(".g-overline").style("opacity",1);

        this.updateBrush(this.data);
        this.tempData = data.slice();
        //d3.select(".g-sector").call(this.brush.move,null);

        let that=this;
        let y = d3.scaleBand()
            .domain(that.sectors.map(function (d) {
                 //console.log(d.key)
                return d.key;
            }))
            .range([120,200])
            .paddingInner(0.1);

        let sectors = data;
        console.log(sectors);
        let overalldata = that.overall;

        let overalline = that.axisscale(0)+2*(that.margin.left);

        let svg = d3.select(".g-graphic").select(".bubbleView");

        let overline = svg.select(".g-overline").selectAll("line")
            .data(overalldata);

        let newoverline = overline.enter().append("line")
            .classed("g-overline",true)
            .attr("transform","translate("+overalline+",150)")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("stroke-opacity",0.5)
            .attr("fill-opacity",0.5)
            .style("opacity",0);

        overline.exit()
            .style("opacity", 1)
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .remove();

        overline = newoverline.merge(overline);

        overline.transition()
            .duration(1000)
            .attr("y1", -60)
            .attr("y2",function () {
                if(sectors.length == 1){
                    return 60;
                }else{
                    return 680;
                }})
            .style("opacity",1);


        let sector = svg.append("g").attr("class","g-sector").selectAll("g").data(sectors);

        sector = sector.enter().append("g")
            .attr("class",function (d,i) {
                return "transition"+i;
            })
            .merge(sector);

        sector.attr("transform", function(d) {
                if (sectors.length === 1){
                    return "translate(" + that.margin.left + ",120)";
                }else {
                    //return "translate(" + that.margin.left + "," + y(d.key) + ")";
                    return "translate(" + that.margin.left + ",120)";
                }});


        let sectortext = svg.select(".g-sector").selectAll(".r-labels")
                .data(sectors);
        sectortext.exit()
            .style("opacity",1)
            .transition()
            .duration(1000)
            .style("opacity",0)
            .remove();

        let newsectortext = sectortext.enter().append("text")
            .attr("x",d=>0)
            .attr("y",d=>70)
            .attr("class", "r-labels")
            .attr("font-size","14px")
            .attr("stroke-opacity",0)
            .attr("fill-opacity",0)
            .style("opacity",0);

        sectortext = newsectortext.merge(sectortext);
        sectortext.transition()
            .duration(1000)
            .attr("x",0)
            .attr("y",function (d,i) {
                    return i*130+75;
            })
            .text(d=>d.key)
            .attr("stroke-opacity", function (d) {
                if (sectors.length === 1){
                    return 0;
                }else {
                    return 1;
                }})
            .attr("fill-opacity", function (d) {
                if (sectors.length === 1){
                    return 0;
                }else {
                    return 1;
                }})
            .style("opacity",1);


        for (let i=0; i<sectors.length;i++ ) {
            let transitlabel =  ".transition" + i;
            //console.log(transitlabel);
            let tData = sectors[i].values;


            svg.select(transitlabel).append("g")
                .attr("class","Brush")
                .call(d3.brushX()
                    .extent([[-20, (i*130)-50], [850, (i*130)+50]])
                    .on("start", that.brushStart)
                    .on("brush end",that.brushBubble.bind(that))
                );

            let sectorCompany = svg.select(transitlabel).selectAll("circle")
                .data(tData);

            sectorCompany.exit()
                .style("opacity", 1)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove();

            let newsectorCompany = sectorCompany.enter().append("circle")
                .attr("cx", function (d) {
                    if (sectors.length !== 1) {
                        return that.cxscale(d.sourceX);
                    } else {
                        return that.cxscale(d.moveX);
                    }
                })
                .attr("cy", function (d) {
                    if (sectors.length !== 1) {
                        return d.sourceY;
                    } else {
                        return d.moveY;
                    }
                })
                .attr("r", function (d) {
                    return that.sizescale(d.total);
                })
               .style("fill", function (d) {
                    return that.colorscale(d.category);
                });


            sectorCompany = newsectorCompany.merge(sectorCompany);

            sectorCompany.transition()
                .duration(1000)
                .attr("cx", function (d) {
                    if (sectors.length === 1) {
                        return that.cxscale(d.sourceX);
                    } else {
                        return that.cxscale(d.moveX);
                    }
                })
                .attr("cy", function (d) {
                    if (sectors.length === 1) {
                        return d.sourceY;
                    } else {
                        return d.moveY;
                    }
                })
                .attr("r", function (d) {
                    return that.sizescale(d.total);
                })
                .style("fill", function (d) {
                    return that.colorscale(d.category);
                })
                .style("opacity", 1);
        }

        d3.selectAll("circle")
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseout", this.mouseout);
    }

    updateList(){
        let that = this;
        let tempD = null;
        //let tempL = null;
        $(function() {

            $('#toggle-event').change(function() {
                if($(this).prop('checked')){
                    tempD = that.sectors.slice();
                    //d3.selectAll(".overallBrush").remove();
                    that.updateBubble(tempD);
                    //tempL = "sectors";
                }else{
                    tempD = that.overall.slice();
                    //console.log(tempD);
                    that.updateBubble(tempD);
                    //tempL = "overall";
                }
            });

        });
    }

    mouseover(d){
        d3.select(".tooltip")
            .style("visibility", "visible");
        d3.select(this)
            .classed("g-active",true);
    }

    mousemove(d) {
        if (d!==undefined){
            var title = toUpcase(d.phrase);
            var position = posFun(d.position);
            var freqValue = freq(d.total);
            d3.select(".tooltip")
                .html(title+"<br/>"+position +"<br/>"+freqValue)
                .style("left",(d3.event.pageX)+"px")
                .style("top",(d3.event.pageY)+"px");

            function toUpcase(s) {
                return s.charAt(0).toUpperCase()+s.slice(1);
            }
            function posFun(d) {
                var v = parseFloat(d);
                if (v>0){
                    return "R+ "+d.toFixed(3)+"%";
                }else{
                    return "D- "+Math.abs(d).toFixed(3)+"%";
                }
            }
            function freq(d) {
                var value = ((parseInt(d) / 50) * 100).toFixed(0) + "%";
                return "In " + value + " of speeches";
            }
        }
    }
    mouseout(){
        d3.select(".tooltip")
            .style("visibility", "hidden");
        d3.select(this)
            .classed("g-active",false);
    }


    clearBrush(){
        let that = this;
        var brush =d3.brushX();
        var group = d3.selectAll(".Brush");
        brush.clear(group);
        //console.log("clear brush");
        d3.selectAll("circle").classed("g-unactive",false);
        that.updateBrush(this.data);
    }

    brushStart(){
        var brush =d3.brushX();
        var group = d3.selectAll(".Brush");
        brush.clear(group);
        d3.selectAll("circle").classed("g-unactive",true);
    }

    brushBubble(d){

        let that = this;
        let tempData = null;
        let dKey = 0;
        //console.log(that.list);
        if(d!==undefined){
            tempData = d.values;
            dKey = that.list[d.key];
        }else{
            tempData = that.data;
        }
        //console.log(tempData);
        //console.log(dKey);
        let transitionL = ".transition"+dKey;
        const selectedData = [];
        const selectedIndices =[]

        //d3.selectAll("circle").style("fill","#666666");
        var selection = d3.event.selection;

        let dataView = tempData.length;
        //console.log(dataView);
        if (selection) {
            const [left, right] = selection;

            tempData.forEach((d,i) => {
                    if (d.sourceX >= that.cxscale.invert(left)&&
                        d.sourceX <= that.cxscale.invert(right)
                    ) {
                        selectedData.push(d);
                        selectedIndices.push(i)
                    }

            });
        }

        if (selectedData.length > 0) {
            d3.select(transitionL).selectAll("circle").filter((_,i)=>{
                //console.log(i);
                return selectedIndices.includes(i);
            })
                .classed("g-unactive",false);

            this.selectedData = selectedData.slice();
            that.updateBrush(this.selectedData);
        }
    }

    showExtremes(){
        let that = this;
        d3.select(".g-table").style("opacity", 0.3);
        d3.select(".g-sector").style("opacity",0.3);
        d3.select(".g-overline").style("opacity",0.3);
        let viewData = that.tempData;
        //--------sorting data by "position" attribute and draw information Box--------
        let extData = this.data
            .sort(function (a,b) {
                return d3.descending(parseFloat(a.position),parseFloat(b.position));
            });
        //console.log(extData);
        let leftmost = extData[401];
        let rightmost = extData[0];
        var lx = null;
        var ly = null;
        var rx = null;
        var ry = null;

        if(viewData.length ===1){
            lx = leftmost.sourceX;
            ly = leftmost.sourceY;
            rx = rightmost.sourceX;
            ry = rightmost.sourceY;
        }else{
            lx = leftmost.moveX;
            ly = leftmost.moveY;
            rx = rightmost.moveX;
            ry = rightmost.moveY;
        }

        var extGroup = d3.select(".bubbleView").append("g")
            .attr("class","extremes-group");
        var leftline = extGroup.append("line")
            .attr("x1",20)
            .attr("y1",120+ly)
            .attr("x2",20)
            .attr("y2",300)
            .attr("stroke","black");

        var rightline = extGroup.append("line")
            .attr("x1",20+this.cxscale(rx))
            .attr("y1",120+ry)
            .attr("x2",20+this.cxscale(rx))
            .attr("y2",250)
            .attr("stroke","black");

        var leftCircle = extGroup.append("circle")
            .attr("cx",this.cxscale(lx))
            .attr("cy",ly)
            .attr("r",this.sizescale(leftmost.total))
            .attr("transform","translate( "+ (that.margin.left) + ",120)")
            .attr("fill", "steelblue");
            //.attr("fill",this.colorscale(leftmost.category));

        var rightCircle = extGroup.append("circle")
            .attr("cx",this.cxscale(rx))
            .attr("cy",ry)
            .attr("r",this.sizescale(rightmost.total))
            .attr("transform","translate( "+ (that.margin.left) + ",120)")
            .attr("fill","red");
            //.attr("fill",this.colorscale(rightmost.category));

        extGroup.append("rect")
            .attr("x",20)
            .attr("y",300)
            .attr("width", 180)
            .attr("height", 80)
            .attr("fill","white")
            .attr("stroke","black");

        extGroup.append("rect")
            .attr("x",this.cxscale(rx)-160)
            .attr("y",240)
            .attr("width", 180)
            .attr("height", 80)
            .attr("fill","white")
            .attr("stroke","black");

        var leftfo = extGroup.append('foreignObject')
            .classed("bbox",true)
            .attr("opacity",1)
            .attr("x",30)
            .attr("y",305)
            .attr("width",160)
            .attr("height",90);

        var ldiv = leftfo.append("xhtml:div")
            .attr("overflow-y","auto")
            .text("Democratic speeches mentioned climate change 49.11% more");

        var rightfo = extGroup.append('foreignObject')
            .classed("bbox",true)
            .attr("opacity",1)
            .attr("x",this.cxscale(rx)-150)
            .attr("y",245)
            .attr("width",160)
            .attr("height",90);

        var rdiv = rightfo.append("xhtml:div")
            .attr("overflow-y","auto")
            .text("Republican speeches mentioned prison 52.33% more");

        d3.select("#extremes-group").style("opacity",1);
    }

    hiddenExtremes() {
        d3.select(".extremes-group").remove();
        d3.select(".g-table").style("opacity", 1);
        d3.select(".g-sector").style("opacity", 1);
        d3.select(".g-overline").style("opacity",1);

    }

}
