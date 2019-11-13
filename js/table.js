class Table {

    constructor(teamData){
        this.tableElements = teamData.slice();
        this.tableHeaders = ["Phrase", "Frequency", "Percentage", "Total"];

        this.cell = {
            "width": 60,
            "height": 20,
            "buffer": 15
        };

        this.freqScale =d3.scaleLinear()
            .domain([0.0,1.0])
            .range([0,1.5*this.cell.width]);

        this.perScale = d3.scaleLinear()
            .domain([-100,100])
            .range([0,2*this.cell.width]);

        this.colorscale = d3.scaleOrdinal(d3.schemeSet2);

        this.wScale = d3.scaleLinear()
            .domain([0,1])
            .range([0,1.5*this.cell.width]);

        this.pwScale = d3.scaleLinear()
            .domain([0,100])
            .range([0,this.cell.width]);
        this.sorting ={
            0: 1,
            1: 1,
            2: 1,
            3: 1,
        };

        this.createTable();
        this.updateTable();
    }

    createTable() {
        let that = this;

        let freqAxis = d3.axisTop().scale(this.freqScale)
            .tickValues([0.0, 0.5, 1.0]);

        let freqAxisTable = d3.select("#freqHeader")
            .append("svg")
            .attr("width", 1.5*(this.cell.width+this.cell.buffer))
            .attr("height", this.cell.height);
        freqAxisTable.append("g")
            .call(freqAxis)
            .attr("class","g-x g-axis")
            .attr("transform", "translate("+this.cell.buffer+" , "+ this.cell.height + ")");

        var tickLabels = [100,50,0,50,100];
        let perAxis = d3.axisTop().scale(this.perScale)
            .tickValues([-100,-50,0,50,100])
            .tickFormat(function(d,i){
                return tickLabels[i]
            });

        let perAxisTable = d3.select("#perHeader")
            .append("svg")
            .attr("width", 2*(this.cell.width+this.cell.buffer))
            .attr("height", this.cell.height);
        perAxisTable.append("g")
            .call(perAxis)
            .attr("class","g-x g-axis")
            .attr("transform", "translate("+this.cell.buffer+" , "+ this.cell.height + ")");

        let header = d3.select("#matchTable").select("#header").selectAll("th");
        header.on("click",(d,i)=>{

            this.tableElements = this.tableElements.sort(function (a,b) {
                let result = 0;
                let switchValue = that.sorting[i];
                let perA = parseFloat(a.percent_of_d_speeches)+parseFloat(a.percent_of_r_speeches);
                let perB = parseFloat(b.percent_of_d_speeches)+parseFloat(b.percent_of_r_speeches);
                switch(i) {
                    case 0:
                        if (a.phrase > b.phrase) {
                            result = 1*(switchValue);
                        }
                        if (a.phrase < b.phrase){
                            result =  -1*(switchValue);
                        }
                        return result;
                        break;
                    case 1:
                    case 3:
                        if (parseInt(a.total) > parseInt(b.total)){
                            result = -1*(switchValue);
                        }
                        if (parseInt(a.total) < parseInt(b.total)){
                            result =  1*(switchValue);
                        }
                        return result;
                        break;
                    case 2:
                        if (perA > perB) {
                            result = -1*(switchValue);
                        }
                        if (perA < perB){
                            result =  1*(switchValue);
                        }
                        return result;
                        break;
                }});
            this.sorting[i] = this.sorting[i]*(-1);
            for (let j = 0; j < 4; j++){
                if (j !== i){
                    this.sorting[j] = 1;
                }
            }

            //console.log(this.sorting.filter(this.sorting.key !== i));
            this.updateTable();

        });


    }

    updateTable() {


        //console.log(this.tableElements);
        let tr = d3.select("#matchTable").select("tbody").selectAll("tr").data(this.tableElements);
        let newTr = tr.enter().append("tr")
            .attr("height",this.cell.height);
        tr.exit().remove();
        tr = newTr.merge(tr);

        tr.attr("id", d=>d.key);

        let td=tr.selectAll("td").data((d)=>{
            let visData = [
                {"vis":"text","value":d.phrase},
                {"vis": "bar1", "value": [d.total/50, d.category]},
                {"vis":"bar2","value":[parseFloat(d.percent_of_d_speeches),parseFloat(d.percent_of_r_speeches)]},
                {"vis":"data","value": parseInt(d.total)}
            ];
            return visData;
        });

        td = td.enter().append("td").merge(td);
        let phraseChart = td.filter((d)=>{
            return d.vis === "text";
        });
        phraseChart.select("svg").remove();
        phraseChart.append("svg")
            .attr("height",this.cell.height)
            .attr("width", this.cell.width*2.5)
            .attr("opacity",0.7);

        phraseChart.select("svg")
            .append("text")
            .attr("font-size", 12)
            .attr("font-weight","bold")
            .attr("x",0)
            .attr("y", 0)
            .text(d =>d.value)
            .attr("transform","translate("+(this.cell.buffer)/2+",16)");

        let freqChart = td.filter((d)=>{
            return d.vis === "bar1";
        });

        freqChart.select("svg").remove();
        freqChart.append("svg")
            .attr("height",this.cell.height)
            .attr("width", 1.5*(this.cell.width))
            .attr("transform","translate("+(this.cell.buffer+4)+",2)");

        freqChart.select("svg")
            .append("rect")
            .attr("height",this.cell.height)
            .attr("width", d=>this.wScale(d.value[0]))
            .attr("fill",d=>this.colorscale(d.value[1]));

        let pChart = td.filter((d)=>{
            return d.vis === "bar2";
        });

        pChart.select("svg").remove();
        pChart.append("svg")
            .attr("height",this.cell.height)
            .attr("width", 2*(this.cell.width))
            .attr("transform","translate("+(this.cell.buffer+4)+",2)");

        pChart.select("svg")
            .append("rect")
            .attr("height",this.cell.height)
            .attr("width", d=>this.pwScale(d.value[0])+1)
            .attr("fill","steelblue")
            .attr("transform","translate("+this.cell.width+",0) scale(-1,1)");

        pChart.select("svg")
            .append("rect")
            .attr("x", this.cell.width+2)
            .attr("height",this.cell.height)
            .attr("width", d=>this.pwScale(d.value[1])+1)
            .attr("fill","salmon");

        let totalChart = td.filter((d)=>{
            return d.vis === "data";
        });
        totalChart.select("svg").remove();
        totalChart.append("svg")
            .attr("height",this.cell.height)
            .attr("width", this.cell.width)
            .attr("opacity",0.7);

        totalChart.select("svg")
            .append("text")
            .attr("font-size", 12)
            .attr("font-weight","bold")
            .attr("text-align","center")
            .attr("x",(this.cell.width)*0.4)
            .attr("y", 16)
            .text(d =>d.value);


    }

    updateList(d){
        this.tableElements=d.slice();
        //console.log(this.tableElements);
        this.updateTable();

    }
}