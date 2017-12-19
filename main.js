
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
        params = {"studyDbIds" : [form.study], "observationLevel" : form.unit};
        loadBrAPIData(form.server,params,function(response){
          useBrAPIData(response,(!!form.group));
        });
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
function useBrAPIData(response,groupByAccession){
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
  var trait_names = d3.keys(traits);
  data.forEach(function(datum){
    trait_names.forEach(function(trait){
      if (datum[trait]==undefined||datum[trait]==null||datum[trait]==NaN){
        datum[trait] = null
      }
    })
  });
  var tableCols = [
    {title:"Study",data:"studyName"},
    {title:"Block",data:"blockNumber"},
    {title:"Plot",data:"plotNumber"},
    {title:"Accession",data:"germplasmName"},
  ];
  
  if (groupByAccession){
    var grouped = d3.nest().key(function(d){return d.germplasmDbId}).entries(data);
    var newdata = grouped.map(function(group){
      var newDatum = {};
      newDatum.germplasmName = group.values[0].germplasmName;
      newDatum.germplasmDbId = group.key;
      newDatum.count = group.values.length;
      newDatum.group = group.values;
      trait_names.forEach(function(trait_key){
        var avg = d3.mean(group.values,function(d){
          if (d[trait_key]!==null){
            return d[trait_key];
          }
        });
        newDatum[trait_key] = avg==undefined?null:avg;
      });
      return newDatum;
    });
    console.log(newdata);
    var tableCols = [
      {title:"Accession", data:"germplasmName"},
      {title:"Units", data:"count"}
    ];
    data = newdata;
  }
  

  // use the list of shared traits to create dataTables columns
  tableCols = tableCols.concat(trait_names.map(function(d){
    return {title:d,data:d};
  }));
  
  // create the root filter object and datatable
  var gfilter = GraphicalFilter();
  gfilter.create("#filter_div","#filtered_results",data,tableCols,trait_names);
}
