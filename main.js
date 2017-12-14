
$(document).ready(function(){
    var run = false;
    $("#brapi-form").submit(function(){
        if (run) {
            $("#filtered_results").DataTable().destroy();
            $("#filtered_results").html("");
        }
        run = true;
        var form = $(this).serializeArray().reduce(function(vals,entry){
            vals[entry.name] = entry.value
            return vals
        },{});
        params = {"studyDbIds" : [form.study], "observationLevel" : "plot"};
        loadBrAPIData(form.server,params,useBrAPIData);
        return false;
    })
});

function loadBrAPIData(server,parameters,success){
    url = server;
    if (url.slice(0,8)!="https://" && url.slice(0,7)!="http://"){
        url ="http://"+url;
    }
    url+= "/brapi/v1/phenotypes-search";
    data = {
        "pageSize" : 10000000,
        "page" : 0
    };
    d3.entries(parameters).forEach(function(entry){
        data[entry.key] = data[entry.key]||entry.value;
    });
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: success,
    });
};

// filters and modifies the response and then creates the root filter object
// and datatable
function useBrAPIData(response){
  console.log(response);
  var traits = {};
  var data = response.result.data
    .map(function(observeUnit){
      var newObj = {};
      d3.entries(observeUnit).forEach(function(entry){
        if (entry.key!="observations"){
            newObj[entry.key] = entry.value;
        }
      });
      observeUnit.observations.forEach(function(obs){
            newObj[obs.observationVariableName] = obs.value;
            traits[obs.observationVariableName] = true;
      });
      return newObj;
    });
  var rangeTraits = d3.keys(traits);
  data.forEach(function(datum){
    rangeTraits.forEach(function(trait){
      datum[trait] = datum[trait] || null;
    })
  })

  // use the list of shared traits to create dataTables columns
  var tableCols = [
    {title:"Study",data:"studyName"},
    {title:"Block",data:"blockNumber"},
    {title:"Plot",data:"plotNumber"},
    {title:"Accession",data:"germplasmName"},
  ].concat(rangeTraits.map(function(d){
    return {title:d,data:d};
  }));
  
  // create the root filter object and datatable
  var gfilter = GraphicalFilter();
  gfilter.create("#filter_div","#filtered_results",data,tableCols,rangeTraits);
}
