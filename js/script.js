d3.json('data/words.json').then( data => {

/**
 * Loads in the tree information from fifa-tree-2018.csv and calls createTree(csvData) to render the tree.
 *
 */
    //console.log(data);
    this.selectedData = null;
    let that = this;
    //data.forEach(d,i) =>{d.id}



    let table = new Table(data);


    function updateBrush(d){
        this.selectedData = d;
        if(this.selectedData == undefined || this.selectedData ==null){
            return null
        }
        //console.log(this.selectedData);
        table.updateList(this.selectedData);
    }

    new Bubble(data,updateBrush,this.selectedData);

});