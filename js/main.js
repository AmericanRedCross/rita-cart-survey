

// global variables
// ================
var surveyData = [];
var surveyQuestions = [];
var answers = ["agree_strongly", "agree", "neither", "disagree", "disagree_strongly", "unsure", "na"];
var summedResponses = [];
var totalCount = 0;

// helper functions
// ================

// comma seperator for thousands
var formatCommas = d3.format(",");

// function chain
// ==============

// get CSV files
function getData(){
  d3.csv("data/HLA-SurveyData.csv", function(data){ 
    surveyData = data;
    getQuestions();
  });
}

function getQuestions(){
  d3.csv("data/SurveyQuestions.csv", function(data){ 
    surveyQuestions = data;
    buildHtml();
  });
}

function buildHtml() {
	totalCount = surveyData.length;
	$("#surveyCount").html(totalCount);
	$.each(surveyQuestions, function(index, question){
		var sectionId = '#' + question.id;
		var questionHtml = '<div id="' + question.name + '" class="question-block">' +
			'<h5>' + question.label + 
			((question.hint !== "none") ? '<br><small>' + question.hint + '</small>' : '') +
			'</h5><div class="responsesBar">' +
	          '<svg width="100%" height="30">' +
	            '<rect class="response-bar na" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar unsure" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar disagree_strongly" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar disagree" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar neither" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar agree" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar agree_strongly" y="0" height="100%" ></rect>' +
	          '</svg>' +
			'</div>';
		$(sectionId).append(questionHtml);
		var questionId = '#' + question.name;
	});
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
	

		$.each(surveyData, function(responseIndex, response){
			var thisAnswer = response[question.name];
			questionObject[question.name][thisAnswer] += 1;
		});
		summedResponses.push(questionObject);
		// summedResponses = { {A01: {agree:52, agree_strongly:5, disagree:16, ...}},{A02: {agree:56; ...}}, ... }
	});
	graphData();
}



function graphData() {
	
	$.each(summedResponses, function(questionIndex, questionObject){
		var questionDivId = '';
		var thisQuestionData;
		for(key in questionObject){
			questionDivId = '#' + key; // "#A01", "#A02", ...
			thisQuestionData = questionObject[key];
		}
		var agree_strongly = ( thisQuestionData["agree_strongly"] / totalCount ) * 100;
		thisQuestionData["agree_strongly"] = agree_strongly.toString() + "%";
		var agree = agree_strongly + ( ( thisQuestionData["agree"] / totalCount ) * 100 );
		thisQuestionData["agree"] = agree.toString() + "%";
		var neither = agree + ( ( thisQuestionData["neither"] / totalCount ) * 100 );
		thisQuestionData["neither"] = neither.toString() + "%";
		var disagree = neither + ( ( thisQuestionData["disagree"] / totalCount ) * 100 );
		thisQuestionData["disagree"] = disagree.toString() + "%";
		var disagree_strongly = disagree + ( ( thisQuestionData["disagree_strongly"] / totalCount ) * 100 );
		thisQuestionData["disagree_strongly"] = disagree_strongly.toString() + "%";
		var unsure = disagree_strongly + ( ( thisQuestionData["unsure"] / totalCount ) * 100 );
		thisQuestionData["unsure"] = unsure.toString() + "%";
		var na = unsure + ( ( thisQuestionData["na"] / totalCount ) * 100 );
		thisQuestionData["na"] = na.toString() + "%";
		$.each(thisQuestionData, function(index, responseCategory){
			var selector = questionDivId + " ." + index;
			$(selector).attr("width", responseCategory);
		});

	});

	$(".loader").remove()
}



		// d3.select(questionId).select(".responsesBar").append("svg")
		// 	.attr("height", 30)
		// 	.attr("width", 30)
		// 	.attr("class", "agree");

      // <div id="sectionA">
      // <h3>Section A: Effects of Yolanda</h3>
  
      // <div id="A01">
      //   <h5>1. Family income has returned to pre-Yolanda levels.<br><small>question.hint</small></h5>
      //   <div class="responsesBar"></div>
      // </div>

      // </div>


// build HTML page first
// then pass use pass the data to function(s) to style the elements on the page
// so that later we can build in filtering and just repass the data, not rebuild the whole page





// function generateGraphs(){
//   var admin4List = [];
//   $.each(displayedShelters, function(index, shelter){
//     if($.inArray(shelter.properties.admin4, admin4List) === -1){
//       admin4List.push(shelter.properties.admin4);
//     }
//   });
//   var maleYoung = 0;
//   var maleChild = 0;
//   var maleAdult = 0;
//   var maleSenior = 0;
//   var femaleYoung = 0;
//   var femaleChild = 0;
//   var femaleAdult = 0;
//   var femaleSenior = 0;
//   var pregnant = 0;
//   var mSingleHead = 0;
//   var fSingleHead = 0;
//   var mDisabled = 0;
//   var fDisabled = 0;
//   $.each(demographicData, function(index, household){
//     if($.inArray(household.admin4, admin4List) !== -1){
//       maleYoung += parseInt(household.male_young, 10);
//       maleChild += parseInt(household.male_child, 10);
//       maleAdult += parseInt(household.male_adult, 10);
//       maleSenior += parseInt(household.male_senior, 10);
//       femaleYoung += parseInt(household.female_young, 10);
//       femaleChild += parseInt(household.female_child, 10);
//       femaleAdult += parseInt(household.female_adult, 10);
//       femaleSenior += parseInt(household.female_senior, 10); 
//       pregnant += parseInt(household["vulnerabilities/pregnant_lactating"], 10);     
//       mDisabled += parseInt(household["vulnerabilities/disabled_ill_male"], 10);
//       fDisabled += parseInt(household["vulnerabilities/disabled_ill_female"], 10);
//       if(household["vulnerabilities/single_headed"] === "yes"){
//         switch(household["vulnerabilities/single_headed_sex"]){
//           case 'male':
//             mSingleHead += 1;
//             break;
//           case 'female':
//             fSingleHead += 1;
//             break;
//         }
//       }
//     }
//   });
//   var femaleTotal = femaleYoung + femaleChild + femaleAdult + femaleSenior;
//   var maleTotal = maleYoung + maleChild + maleAdult + maleSenior;
//   var grandTotal = femaleTotal + maleTotal;
//   $("#maleYoung").html(formatCommas(maleYoung));
//   $("#maleChild").html(formatCommas(maleChild));
//   $("#maleAdult").html(formatCommas(maleAdult));
//   $("#maleSenior").html(formatCommas(maleSenior));
//   $("#femaleYoung").html(formatCommas(femaleYoung));
//   $("#femaleChild").html(formatCommas(femaleChild));
//   $("#femaleAdult").html(formatCommas(femaleAdult));
//   $("#femaleSenior").html(formatCommas(femaleSenior));
//   $("#pregnant").html(formatCommas(pregnant));
//   $("#mSingleHead").html(formatCommas(mSingleHead));
//   $("#fSingleHead").html(formatCommas(fSingleHead));
//   $("#mDisabled").html(formatCommas(mDisabled));
//   $("#fDisabled").html(formatCommas(fDisabled));
//   $("#mSingleHead").html(formatCommas(mSingleHead));
//   $("#fSingleHead").html(formatCommas(fSingleHead));
//   $("#maleTotal").html(formatCommas(maleTotal));
//   $("#femaleTotal").html(formatCommas(femaleTotal));
//   $("#grandTotal").html(formatCommas(grandTotal));
// }

//start function chain for map
getData();