// global variables
// ================
var activeRegion = "ALL";
var activeCountry = "ALL";
var activeCommunity = "ALL";
var activeRegionName = "";
var activeCountryName = "";
var activeCommunityName = "";

var surveyData = [];
var filteredData = [];
var surveyQuestions = [];
var answers = ["strongly_agree", "agree", "neither", "disagree", "strongly_disagree", "dont_know"];
var summedResponses = [];
var totalCount = 0;

// helper functions
// ================

// comma seperator for thousands
var formatCommas = d3.format(",");

//round to one decimal
var noDecimal = d3.format(".0f");

// function chain
// ==============

// get CSV files
function getData(){
  d3.csv("data/rita-survey-data.csv", function(data){
    surveyData = data;
    getQuestions();
  });
}

function getQuestions(){
  d3.csv("data/survey-questions.csv", function(data){
    surveyQuestions = data;
    buildHtml();
  });
}

function buildHtml() {
	totalCount = surveyData.length;
	$("#surveyCount").html(formatCommas(totalCount.toString()));
	$.each(surveyQuestions, function(index, question){
		var sectionId = '#' + question.id;
		var questionHtml = '<div id="' + question.name + '" class="question-block">' +
			'<h5>' + question["label-spanish"] +
			((question["hint-spanish"] !== "none") ? '<br><small>' + question["hint-spanish"] + '</small>' : '') +
			'<br><span class="text-english">' + question["label"] + '</span>' +
			((question["hint"] !== "none") ? '<br><small><span class="text-english">' +
			question["hint"] + '</span>' + '</small>' : '') +
			'</h5><div class="responsesBar">' +
	          '<svg width="100%" height="30">' +
	            '<rect class="response-bar dont_know" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar strongly_disagree" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar disagree" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar neither" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar agree" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar strongly_agree" y="0" height="100%" ></rect>' +
	          '</svg>' +
			'</div>';
		$(sectionId).append(questionHtml);
	});
	buildRegionDropdown();
}

function buildRegionDropdown() {
  var regionList = [];
  $.each(surveyData, function(index, record){
    var thisRegion = record["region"];
    if($.inArray(thisRegion, regionList) === -1){
      regionList.push(thisRegion);
    }
  });
  // sort so that the provinces appear in alphabetical order in dropdown
  regionList = regionList.sort();
  // create item elements in dropdown list
  for(var i = 0; i < regionList.length; i++) {
      var item = regionList[i];
      var listItemHtml = '<li id="'+item+'"><a href="#" onClick="regionSelect('+
        "'"+ item +"', this"+ '); return false;">' + item + "</li>";
      $('#dropdown-menu-region').append(listItemHtml);
  }
  $("#loading").fadeOut(300);
  filterData();
}

function resetFilters() {
  activeRegion= "ALL";
  activeCountry = "ALL";
  activeCommunity = "ALL";
  $('#dropdown-menu-country').html('<li class="disabled"><a role="menuitem" href="#">First select a region</a></li>');
  $('#dropdown-menu-community').html('<li class="disabled"><a role="menuitem" href="#">First select a country</a></li>');
  $("#selected-admin-label").html("All surveys");
	filterData();
}

function regionSelect(region, element){
  activeRegion = region;
  activeRegionName = $(element).html();
  activeCountry = "ALL";
  activeCountryName = "";
  activeCommunity = "ALL";
  activeCommunityName = "";
  $("#selected-admin-label").html(activeRegionName);
  buildCountryDropdown();
	filterData();
}

function countrySelect(country, element){
  activeCountry = country;
  activeCountryName = $(element).html();
  activeCommunity = "ALL";
  activeCommunityName = "";
  $("#selected-admin-label").html(activeRegionName + ", " + activeCountryName);
  buildCommunityDropdown();
	filterData();
}

function communitySelect(community, element){
  activeCommunity = community;
  activeCommunityName = $(element).html();
  $("#selected-admin-label").html(activeRegionName + ", " + activeCountryName + ", "+ activeCommunityName);
	filterData();
}

function buildCountryDropdown(){
  $('#dropdown-menu-country').empty();
  $('#dropdown-menu-community').html('<li class="disabled"><a role="menuitem" href="#">First select a country</a></li>');
  var countryList = [];
  $.each(surveyData, function(index, record){
    var thisCountry = record["country"];
    if($.inArray(thisCountry, countryList) === -1 && record.region === activeRegion){
      countryList.push(thisCountry);
    }
  });
  // sort so that they appear in alphabetical order in dropdown
  countryList = countryList.sort();
  // create item elements in dropdown list
  for(var i = 0; i < countryList.length; i++) {
      var item = countryList[i];
      var listItemHtml = '<li id="'+item+'"><a href="#" onClick="countrySelect(' +
        "'"+ item +"', this"+ '); return false;">' + item + "</li>"
      $('#dropdown-menu-country').append(listItemHtml);
  }
}

function buildCommunityDropdown() {
  $('#dropdown-menu-community').empty();
  var communityList = [];
  $.each(surveyData, function(index, record){
    var thisCommunity = record["community"];
    if($.inArray(thisCommunity, communityList) === -1 && record.region === activeRegion && record.country === activeCountry){
      communityList.push(thisCommunity);
    }
  });
  // sort so that they appear in alphabetical order in dropdown
  communityList = communityList.sort();
  // create item elements in dropdown list
  for(var i = 0; i < communityList.length; i++) {
      var item = communityList[i];
      var listItemHtml = '<li id="'+item+'"><a href="#" onClick="communitySelect(' +
        "'"+ item +"', this"+ '); return false;">' + item + "</li>"
      $('#dropdown-menu-community').append(listItemHtml);
  }
}


function filterData(){
  filteredData = [];
  $.each(surveyData, function(index, record){
      if(record.region === activeRegion || "ALL" === activeRegion){
        if(record.country === activeCountry || "ALL" === activeCountry){
          if(record.community === activeCommunity || "ALL" === activeCommunity){
            filteredData.push(record);
          }
        }
      }
  });
  $("#selected-survey-count").html(formatCommas(filteredData.length.toString()));
  parseData();
}


function parseData() {
	summedResponses = [];
	// count up responses by question (A01, A02, ...) and answer (strongly_agree, agree, ...)
	$.each(surveyQuestions, function(questionIndex, question){
		var questionObject = {};
		var answerCountsObject = {};
		$.each(answers, function(answerIndex, answer){
			answerCountsObject[answer] = 0;
		});
		questionObject[question.name] = answerCountsObject;


		$.each(filteredData, function(responseIndex, response){
			var thisAnswer = response[question.name];
			questionObject[question.name][thisAnswer] += 1;
		});
		summedResponses.push(questionObject);
		// summedResponses = { {A01: {agree:52, strongly_agree:5, disagree:16, ...}},{A02: {agree:56; ...}}, ... }
	});
	graphData();
}

function graphData() {


	$.each(summedResponses, function(questionIndex, questionObject){
		var questionDivId = '';
		var thisQuestionData = {};

		$.each(questionObject, function(questionIndex, questionData){
			questionDivId = '#' + questionIndex; // "#A01", "#A02", ...
			thisQuestionData = questionData;
		});

		// calculate the percentage for each and add to the div as an html data attr for the tooltip
		$.each(thisQuestionData, function(answerIndex, answerData){
			thisQuestionData[answerIndex] = ( answerData / filteredData.length ) * 100;
			var selector = questionDivId + " ." + answerIndex;
			var styledPercentage = noDecimal(thisQuestionData[answerIndex]) + "%";
			$(selector).attr("data-percentage", styledPercentage);
		});

		// the viz is overlapping svg rectangle in the same category order
		// calculate each width as its own percentage plus those to the left
		var strongly_agree = thisQuestionData["strongly_agree"];
		thisQuestionData["strongly_agree"] = strongly_agree.toString() + "%";

		var agree = strongly_agree + thisQuestionData["agree"];
		thisQuestionData["agree"] = agree.toString() + "%";

		var neither = agree + thisQuestionData["neither"];
		thisQuestionData["neither"] = neither.toString() + "%";

		var disagree = neither + thisQuestionData["disagree"];
		thisQuestionData["disagree"] = disagree.toString() + "%";

		var strongly_disagree = disagree + thisQuestionData["strongly_disagree"];
		thisQuestionData["strongly_disagree"] = strongly_disagree.toString() + "%";

		var dontknow = strongly_disagree + thisQuestionData["dont_know"];
		thisQuestionData["dont_know"] = dontknow.toString() + "%";



		// use the calculated widths to adjust the rectangles
		$.each(thisQuestionData, function(indexa, responseCategorya){
			var selector = " ." + indexa;
			d3.select(questionDivId).select(selector).transition().attr("width", responseCategorya);
		});


	});

	d3.selectAll(".response-bar").on("mouseover", function(d){
		var tooltipText = $(this).attr("data-percentage");
		$('#tooltip').append(tooltipText);
	}).on("mouseout", function(){
        $('#tooltip').empty();
    });
	$(".response-bar").mouseover(function(e) {
        //Set the X and Y axis of the tooltip
        $('#tooltip').css('top', e.pageY  );
        $('#tooltip').css('left', e.pageX + 20 );
    }).mousemove(function(e) {
        //Keep changing the X and Y axis for the tooltip, thus, the tooltip move along with the mouse
        $("#tooltip").css({top:(e.pageY)+"px",left:(e.pageX+20)+"px"});
    });

    $(".loader").fadeOut(400);
}

//start function chain for map
getData();
